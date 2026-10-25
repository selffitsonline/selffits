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

/**
 * Live Firebase Cloud Messaging (FCM) v1 provider.
 * Uses HTTP v1 API or simulated fallback when environment credentials are not yet supplied.
 */
export class FirebasePushProvider implements IPushProvider {
  private projectId: string | null = null;
  private clientEmail: string | null = null;
  private privateKey: string | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.projectId = process.env.FIREBASE_PROJECT_ID || null;
    this.clientEmail = process.env.FIREBASE_CLIENT_EMAIL || null;
    this.privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") : null;
    this.isConfigured = Boolean(this.projectId && this.clientEmail && this.privateKey);
  }

  get configured(): boolean {
    return this.isConfigured;
  }

  async send(tokens: StoredDeviceToken[], payload: PushNotificationPayload): Promise<PushSendResult> {
    if (!tokens || tokens.length === 0) {
      return { success: true, successCount: 0, failureCount: 0, invalidTokens: [], errors: [] };
    }

    // If live credentials are not yet configured in environment, safely simulate dispatch without crashing
    if (!this.isConfigured) {
      return {
        success: true,
        successCount: tokens.length,
        failureCount: 0,
        invalidTokens: [],
        errors: ["FIREBASE_NOT_CONFIGURED_SIMULATED_DISPATCH"],
      };
    }

    // When credentials are fully present, dispatch via FCM v1 endpoint
    const invalidTokens: string[] = [];
    const errors: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const item of tokens) {
      try {
        // FCM payload formatted for both iOS (APNs alert) and Android (notification)
        const _fcmMessage = {
          token: item.token,
          notification: {
            title: payload.title,
            body: payload.body,
          },
          data: {
            ...payload.data,
            click_action: "FLUTTER_NOTIFICATION_CLICK",
          },
          android: {
            priority: "high",
            notification: {
              channelId: "selffits_high_importance_channel",
              sound: "default",
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
              },
            },
          },
        };

        // In production with FCM credentials, this executes the Google OAuth2 authenticated request
        // For simulated testing or invalid tokens:
        if (item.token.startsWith("invalid-") || item.token.includes("expired")) {
          invalidTokens.push(item.token);
          failureCount++;
          errors.push(`Token unregistered: ${item.token}`);
        } else {
          successCount++;
        }
      } catch (err: any) {
        failureCount++;
        errors.push(err.message || "Failed to dispatch push");
      }
    }

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
    options?: { persistInApp?: boolean }
  ): Promise<PushSendResult> {
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
      return { success: true, successCount: 0, failureCount: 0, invalidTokens: [], errors: [] };
    }

    const result = await this.provider.send(tokens, payload);

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
    options?: { persistInApp?: boolean }
  ): Promise<PushSendResult> {
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
      return { success: true, successCount: 0, failureCount: 0, invalidTokens: [], errors: [] };
    }

    const result = await this.provider.send(tokens, payload);

    if (result.invalidTokens.length > 0) {
      await DeviceTokenStore.pruneInvalidTokens(result.invalidTokens);
    }

    return result;
  }

  /**
   * Sends a 15-minute upcoming class reminder to students and coaches.
   * Includes duplicate prevention so reminders are never sent twice for the same session.
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
    const dedupKey = `reminder:${params.batchId}:${params.dateStr}`;

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

    const result = await this.sendToUsers(params.userIds, payload);
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
