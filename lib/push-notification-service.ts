import crypto from "crypto";
import { DeviceTokenStore, StoredDeviceToken } from "./device-token-store";
import { PushNotificationPayload, NotificationType } from "@/types/mobile-api.dto";
import { db } from "./db";

export interface PushSendResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
  errors: string[];
}

export interface IPushProvider {
  send(tokens: StoredDeviceToken[], payload: PushNotificationPayload): Promise<PushSendResult>;
}

export interface FirebasePushProviderOptions {
  projectId?: string | null;
  clientEmail?: string | null;
  privateKey?: string | null;
  fetchFn?: typeof fetch;
}

/**
 * Encodes a buffer or string into URL-safe Base64 without padding.
 */
function base64url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Live Firebase Cloud Messaging (FCM) HTTP v1 Provider.
 * Generates and exchanges Google OAuth2 Service Account assertion JWTs natively,
 * caches short-lived Bearer tokens, and securely dispatches push notifications
 * to Google FCM v1 endpoint without exposing secrets or credentials.
 */
export class FirebasePushProvider implements IPushProvider {
  private projectId: string | null = null;
  private clientEmail: string | null = null;
  private privateKey: string | null = null;
  private fetchFn: typeof fetch;
  private cachedAccessToken: string | null = null;
  private tokenExpiresAt: number = 0; // Milliseconds timestamp

  constructor(options?: FirebasePushProviderOptions) {
    const rawProjectId =
      options?.projectId !== undefined
        ? options.projectId
        : (process.env.FIREBASE_PROJECT_ID || null);
    this.projectId = rawProjectId ? rawProjectId.trim() : null;

    const rawClientEmail =
      options?.clientEmail !== undefined
        ? options.clientEmail
        : (process.env.FIREBASE_CLIENT_EMAIL || null);
    this.clientEmail = rawClientEmail ? rawClientEmail.trim() : null;

    const rawKey =
      options?.privateKey !== undefined
        ? options.privateKey
        : (process.env.FIREBASE_PRIVATE_KEY || null);

    this.privateKey = rawKey
      ? rawKey.replace(/\\n/g, "\n").replace(/^["']|["']$/g, "").trim()
      : null;

    this.fetchFn = options?.fetchFn || globalThis.fetch.bind(globalThis);
  }

  get configured(): boolean {
    return Boolean(this.projectId && this.clientEmail && this.privateKey);
  }

  getProjectId(): string | null {
    return this.projectId;
  }

  /**
   * Resets the cached access token (useful for unit testing or token expiration).
   */
  _resetAccessTokenCache(): void {
    this.cachedAccessToken = null;
    this.tokenExpiresAt = 0;
  }

  /**
   * Generates a signed Google OAuth2 service account JWT assertion and exchanges it
   * for a Google OAuth2 access token with `https://www.googleapis.com/auth/firebase.messaging` scope.
   * Access tokens are cached in memory for up to 55 minutes to minimize network latency.
   */
  async getAccessToken(): Promise<string> {
    const nowMs = Date.now();
    if (this.cachedAccessToken && nowMs < this.tokenExpiresAt) {
      return this.cachedAccessToken;
    }

    if (!this.clientEmail || !this.privateKey) {
      throw new Error("Missing Firebase client email or private key for authentication");
    }

    const nowSec = Math.floor(nowMs / 1000);
    const header = { alg: "RS256", typ: "JWT" };
    const claims = {
      iss: this.clientEmail,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      exp: nowSec + 3600,
      iat: nowSec,
    };

    const encodedHeader = base64url(JSON.stringify(header));
    const encodedClaims = base64url(JSON.stringify(claims));
    const toSign = `${encodedHeader}.${encodedClaims}`;

    let signature: string;
    try {
      const signer = crypto.createSign("RSA-SHA256");
      signer.update(toSign);
      signature = base64url(signer.sign(this.privateKey));
    } catch (signErr: any) {
      throw new Error(`Failed to sign Firebase service account JWT: ${signErr.message}`);
    }

    const assertion = `${toSign}.${signature}`;

    const tokenRes = await this.fetchFn("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${encodeURIComponent(assertion)}`,
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text().catch(() => "");
      throw new Error(`Google OAuth2 token exchange failed [HTTP ${tokenRes.status}]: ${errorText}`);
    }

    const data = (await tokenRes.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) {
      throw new Error("Google OAuth2 token exchange did not return an access token");
    }

    this.cachedAccessToken = data.access_token;
    const expiresInSec = typeof data.expires_in === "number" ? data.expires_in : 3600;
    // Cache with a 5-minute safety margin
    this.tokenExpiresAt = nowMs + Math.max(0, expiresInSec - 300) * 1000;

    return this.cachedAccessToken;
  }

  /**
   * Dispatches notifications to FCM v1 HTTP endpoint:
   * https://fcm.googleapis.com/v1/projects/{projectId}/messages:send
   */
  async send(tokens: StoredDeviceToken[], payload: PushNotificationPayload): Promise<PushSendResult> {
    if (!tokens || tokens.length === 0) {
      return { success: true, successCount: 0, failureCount: 0, invalidTokens: [], errors: [] };
    }

    if (!this.configured || !this.projectId) {
      return {
        success: false,
        successCount: 0,
        failureCount: tokens.length,
        invalidTokens: [],
        errors: ["FIREBASE_NOT_CONFIGURED: Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY"],
      };
    }

    let accessToken: string;
    try {
      accessToken = await this.getAccessToken();
    } catch (authErr: any) {
      return {
        success: false,
        successCount: 0,
        failureCount: tokens.length,
        invalidTokens: [],
        errors: [`FCM_AUTH_ERROR: ${authErr.message}`],
      };
    }

    const endpoint = `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(this.projectId)}/messages:send`;
    const invalidTokens: string[] = [];
    const errors: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Convert all custom data dictionary attributes to string values (FCM v1 requirement)
    const fcmData: Record<string, string> = {};
    if (payload.data) {
      for (const [key, val] of Object.entries(payload.data)) {
        if (val !== undefined && val !== null) {
          fcmData[key] = String(val);
        }
      }
    }
    if (!fcmData.click_action) {
      fcmData.click_action = "FLUTTER_NOTIFICATION_CLICK";
    }

    await Promise.all(
      tokens.map(async (item) => {
        try {
          const messageBody = {
            message: {
              token: item.token,
              notification: {
                title: payload.title,
                body: payload.body,
              },
              data: fcmData,
              android: {
                priority: "high",
                notification: {
                  channelId: "selffits_high_importance_channel",
                  sound: "default",
                  defaultSound: true,
                  defaultVibrateTimings: true,
                },
              },
              apns: {
                payload: {
                  aps: {
                    alert: {
                      title: payload.title,
                      body: payload.body,
                    },
                    sound: "default",
                    badge: 1,
                    "content-available": 1,
                  },
                },
              },
            },
          };

          const res = await this.fetchFn(endpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json; UTF-8",
            },
            body: JSON.stringify(messageBody),
          });

          if (res.ok) {
            successCount++;
          } else {
            failureCount++;
            const status = res.status;
            let errorDetail = "";
            let isUnregistered = false;

            if (status === 401) {
              // Token expired or invalid authorization, reset cache
              this._resetAccessTokenCache();
            }

            try {
              const errorJson = await res.json();
              const errObj = errorJson?.error;
              const errorCode = errObj?.details?.[0]?.errorCode || errObj?.status || "";
              const errMsg = errObj?.message || "";
              errorDetail = `${status} ${errorCode}: ${errMsg}`.trim();

              const lowerMsg = errMsg.toLowerCase();
              const isExplicitTokenError =
                lowerMsg.includes("registration token") ||
                lowerMsg.includes("not a valid fcm registration token") ||
                lowerMsg.includes("invalid registration");

              if (
                status === 404 ||
                errorCode === "UNREGISTERED" ||
                lowerMsg.includes("unregistered") ||
                lowerMsg.includes("requested entity was not found") ||
                (status === 400 && isExplicitTokenError)
              ) {
                isUnregistered = true;
              }
            } catch {
              errorDetail = `HTTP ${status}`;
              if (status === 404) {
                isUnregistered = true;
              }
            }

            if (isUnregistered) {
              invalidTokens.push(item.token);
            }

            const maskedToken = item.token.length > 8 ? `...${item.token.slice(-6)}` : item.token;
            errors.push(`Token ${maskedToken} delivery failed: ${errorDetail}`);
          }
        } catch (netErr: any) {
          failureCount++;
          const maskedToken = item.token.length > 8 ? `...${item.token.slice(-6)}` : item.token;
          errors.push(`Token ${maskedToken} transport error: ${netErr.message || "Failed to dispatch"}`);
        }
      })
    );

    return {
      success: failureCount === 0,
      successCount,
      failureCount,
      invalidTokens,
      errors,
    };
  }
}

/**
 * Mock Push Provider for testing and local development.
 */
export class MockPushProvider implements IPushProvider {
  public sentMessages: Array<{ tokens: StoredDeviceToken[]; payload: PushNotificationPayload }> = [];
  public simulatedInvalidTokens: Set<string> = new Set();
  public shouldFail: boolean = false;

  async send(tokens: StoredDeviceToken[], payload: PushNotificationPayload): Promise<PushSendResult> {
    if (this.shouldFail) {
      return {
        success: false,
        successCount: 0,
        failureCount: tokens.length,
        invalidTokens: [],
        errors: ["SIMULATED_FCM_NETWORK_FAILURE"],
      };
    }

    this.sentMessages.push({ tokens, payload });

    const invalidTokens: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const t of tokens) {
      if (this.simulatedInvalidTokens.has(t.token) || t.token.includes("invalid")) {
        invalidTokens.push(t.token);
        failureCount++;
      } else {
        successCount++;
      }
    }

    return {
      success: failureCount === 0,
      successCount,
      failureCount,
      invalidTokens,
      errors: invalidTokens.length > 0 ? ["Some tokens unregistered"] : [],
    };
  }

  reset(): void {
    this.sentMessages = [];
    this.simulatedInvalidTokens.clear();
    this.shouldFail = false;
  }
}

// In-memory deduplication cache for class reminders and events (Key: deduplicationKey, Value: timestamp)
const deduplicationCache: Map<string, number> = new Map();
const DEDUP_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

/**
 * Central Push Notification Service
 */
export class PushNotificationService {
  private provider: IPushProvider;

  constructor(provider?: IPushProvider) {
    this.provider = provider || new FirebasePushProvider();
  }

  setProvider(provider: IPushProvider): void {
    this.provider = provider;
  }

  getProvider(): IPushProvider {
    return this.provider;
  }

  /**
   * Dispatches a push notification to all active devices registered to a single user.
   */
  async sendToUser(
    userId: string,
    payload: PushNotificationPayload,
    options?: { persistInApp?: boolean; deduplicationKey?: string }
  ): Promise<PushSendResult & { deduplicated?: boolean }> {
    if (options?.deduplicationKey) {
      const now = Date.now();
      for (const [k, timestamp] of deduplicationCache.entries()) {
        if (now - timestamp > DEDUP_TTL_MS) {
          deduplicationCache.delete(k);
        }
      }

      if (deduplicationCache.has(options.deduplicationKey)) {
        return {
          success: true,
          successCount: 0,
          failureCount: 0,
          invalidTokens: [],
          errors: [],
          deduplicated: true,
        };
      }
    }

    const tokens = await DeviceTokenStore.getUserTokens(userId);

    // Also persist in-app notification in database if requested
    if (options?.persistInApp !== false) {
      try {
        await db.notification.create({
          data: {
            userId,
            title: payload.title,
            message: payload.body,
          },
        });
      } catch (err) {
        console.error("Failed to persist in-app notification:", err);
      }
    }

    if (tokens.length === 0) {
      if (options?.deduplicationKey) {
        deduplicationCache.set(options.deduplicationKey, Date.now());
      }
      return { success: true, successCount: 0, failureCount: 0, invalidTokens: [], errors: [] };
    }

    const result = await this.provider.send(tokens, payload);

    if (options?.deduplicationKey) {
      deduplicationCache.set(options.deduplicationKey, Date.now());
    }

    // Automatically prune invalid tokens reported by FCM
    if (result.invalidTokens.length > 0) {
      await DeviceTokenStore.pruneInvalidTokens(result.invalidTokens);
    }

    return result;
  }

  /**
   * Dispatches a push notification to multiple users.
   */
  async sendToUsers(
    userIds: string[],
    payload: PushNotificationPayload,
    options?: { persistInApp?: boolean; deduplicationKey?: string }
  ): Promise<PushSendResult & { deduplicated?: boolean }> {
    if (options?.deduplicationKey) {
      const now = Date.now();
      for (const [k, timestamp] of deduplicationCache.entries()) {
        if (now - timestamp > DEDUP_TTL_MS) {
          deduplicationCache.delete(k);
        }
      }

      if (deduplicationCache.has(options.deduplicationKey)) {
        return {
          success: true,
          successCount: 0,
          failureCount: 0,
          invalidTokens: [],
          errors: [],
          deduplicated: true,
        };
      }
    }

    if (userIds.length === 0) {
      return { success: true, successCount: 0, failureCount: 0, invalidTokens: [], errors: [] };
    }

    const tokens = await DeviceTokenStore.getUsersTokens(userIds);

    if (options?.persistInApp !== false) {
      try {
        const existingUsers = await db.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true },
        });
        const validUserIds = new Set(existingUsers.map((u) => u.id));

        if (validUserIds.size > 0) {
          await Promise.all(
            Array.from(validUserIds).map((uid) =>
              db.notification.create({
                data: {
                  userId: uid,
                  title: payload.title,
                  message: payload.body,
                },
              })
            )
          );
        }
      } catch (err) {
        console.error("Failed to persist in-app notifications:", err);
      }
    }

    if (tokens.length === 0) {
      if (options?.deduplicationKey) {
        deduplicationCache.set(options.deduplicationKey, Date.now());
      }
      return { success: true, successCount: 0, failureCount: 0, invalidTokens: [], errors: [] };
    }

    const result = await this.provider.send(tokens, payload);

    if (options?.deduplicationKey) {
      deduplicationCache.set(options.deduplicationKey, Date.now());
    }

    if (result.invalidTokens.length > 0) {
      await DeviceTokenStore.pruneInvalidTokens(result.invalidTokens);
    }

    return result;
  }

  /**
   * Sends a 15-minute upcoming class reminder to students and coaches.
   * Includes session-level duplicate prevention so separate sessions on the same day do not suppress each other,
   * while repeat invocations of the same session are safely deduplicated in-memory and in the database.
   */
  async sendClassReminder(params: {
    batchId: string;
    batchName: string;
    coachName: string;
    meetingUrl?: string | null;
    startTimeStr: string;
    userIds: string[];
    dateStr: string;
  }): Promise<PushSendResult & { deduplicated?: boolean }> {
    // Normalize session start time from startTimeStr (e.g. "05:15 PM to 06:00 PM (GMT)" -> "05:15PM")
    const timeMatch = params.startTimeStr.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
    const normalizedStartTime = timeMatch
      ? timeMatch[1].replace(/\s+/g, "").toUpperCase()
      : params.startTimeStr.trim().replace(/[^a-zA-Z0-9]/g, "_");

    const dedupKey = `reminder:${params.batchId}:${params.dateStr}:${normalizedStartTime}`;

    // Clean up expired dedup entries
    const now = Date.now();
    for (const [k, timestamp] of deduplicationCache.entries()) {
      if (now - timestamp > DEDUP_TTL_MS) {
        deduplicationCache.delete(k);
      }
    }

    // Check if reminder was already dispatched for this session
    if (deduplicationCache.has(dedupKey)) {
      return {
        success: true,
        successCount: 0,
        failureCount: 0,
        invalidTokens: [],
        errors: [],
        deduplicated: true,
      };
    }

    const payload: PushNotificationPayload = {
      title: "🥋 Live Class Starting in 15 Minutes!",
      body: `${params.batchName} with ${params.coachName} begins shortly. Tap to enter the dojo.`,
      data: {
        type: "CLASS_REMINDER",
        batchId: params.batchId,
        meetingUrl: params.meetingUrl || undefined,
        deepLink: `selffits://class/live?batchId=${params.batchId}`,
      },
    };

    // Idempotent in-app notification creation with database-level lookup-before-insert check
    if (params.userIds.length > 0) {
      try {
        const existingUsers = await db.user.findMany({
          where: { id: { in: params.userIds } },
          select: { id: true },
        });
        const validUserIds = existingUsers.map((u) => u.id);

        for (const uid of validUserIds) {
          const existing = await db.notification.findFirst({
            where: {
              userId: uid,
              title: payload.title,
              message: { contains: `(Ref: ${dedupKey})` },
            },
          });

          if (!existing) {
            await db.notification.create({
              data: {
                userId: uid,
                title: payload.title,
                message: `${payload.body} (Ref: ${dedupKey})`,
              },
            });
          }
        }
      } catch (err) {
        console.warn("Failed to persist in-app reminder notification idempotently:", err);
      }
    }

    let result: PushSendResult & { deduplicated?: boolean };
    try {
      result = await this.sendToUsers(params.userIds, payload, {
        persistInApp: false, // In-app notification already managed above with deduplication
        deduplicationKey: dedupKey,
      });
    } catch (pushErr: any) {
      console.warn("Failed to dispatch class reminder push notifications:", pushErr);
      return {
        success: false,
        successCount: 0,
        failureCount: params.userIds.length,
        invalidTokens: [],
        errors: [`PUSH_TRANSPORT_ERROR: ${pushErr?.message || "Unknown transport failure"}`],
      };
    }

    deduplicationCache.set(dedupKey, now);

    return result;
  }

  /**
   * Sends a schedule change notification to enrolled students.
   */
  async sendScheduleChange(params: {
    batchId: string;
    batchName: string;
    newTiming: string;
    newDays: string;
    userIds: string[];
  }): Promise<PushSendResult> {
    const payload: PushNotificationPayload = {
      title: "📅 Schedule Update: " + params.batchName,
      body: `Your class schedule has been updated to ${params.newDays} at ${params.newTiming}.`,
      data: {
        type: "SCHEDULE_CHANGE",
        batchId: params.batchId,
        deepLink: `selffits://dashboard/student`,
      },
    };

    return this.sendToUsers(params.userIds, payload);
  }

  /**
   * Sends a class cancellation notification.
   */
  async sendClassCancelled(params: {
    batchId: string;
    batchName: string;
    reason?: string;
    userIds: string[];
  }): Promise<PushSendResult> {
    const payload: PushNotificationPayload = {
      title: "⚠️ Class Cancelled: " + params.batchName,
      body: params.reason
        ? `Today's session has been cancelled: ${params.reason}`
        : `Today's session has been cancelled by administration. Please check your dashboard.`,
      data: {
        type: "CLASS_CANCELLED",
        batchId: params.batchId,
        deepLink: `selffits://dashboard/student`,
      },
    };

    return this.sendToUsers(params.userIds, payload);
  }

  /**
   * Sends an academy announcement notification.
   */
  async sendAnnouncement(params: {
    title: string;
    message: string;
    deepLink?: string;
    userIds: string[];
  }): Promise<PushSendResult> {
    const payload: PushNotificationPayload = {
      title: params.title,
      body: params.message,
      data: {
        type: "ANNOUNCEMENT",
        deepLink: params.deepLink || `selffits://dashboard/student`,
      },
    };

    return this.sendToUsers(params.userIds, payload);
  }

  /**
   * Sends an enrollment or belt progress update notification.
   */
  async sendEnrollmentUpdate(params: {
    programTitle: string;
    message: string;
    userId: string;
    type?: NotificationType;
  }): Promise<PushSendResult> {
    const payload: PushNotificationPayload = {
      title: `🥋 Academy Update: ${params.programTitle}`,
      body: params.message,
      data: {
        type: params.type || "ENROLLMENT_UPDATE",
        deepLink: `selffits://dashboard/student`,
      },
    };

    return this.sendToUser(params.userId, payload);
  }

  /**
   * Clears the deduplication cache (for testing purposes).
   */
  _clearDedupCache(): void {
    deduplicationCache.clear();
  }
}

// Singleton instance used by API routes
export const pushNotificationService = new PushNotificationService();
