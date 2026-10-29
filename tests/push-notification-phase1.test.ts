/**
 * SELFFITS Push Notification Phase 1 Test Suite
 * 
 * Validates:
 * 1. FirebasePushProvider initialization, credential parsing & missing configuration fail-safe.
 * 2. Native RSA-SHA256 OAuth2 service account JWT generation & token exchange verification.
 * 3. Access token in-memory caching & reuse.
 * 4. Successful authenticated dispatch to FCM v1 endpoint (/projects/{projectId}/messages:send).
 * 5. FCM error handling: 404 UNREGISTERED token detection and automatic store pruning.
 * 6. FCM transport/server failures (HTTP 500) and network exceptions.
 * 7. Server-side cron security: fail-closed enforcement when CRON_SECRET is missing or invalid (GET & POST).
 * 8. Class reminder deduplication and token store isolation.
 */

import crypto from "crypto";
import { FirebasePushProvider } from "../lib/push-notification-service";
import { PushNotificationService } from "../lib/push-notification-service";
import { DeviceTokenStore } from "../lib/device-token-store";
import { GET as cronGet, POST as cronPost } from "../app/api/v1/cron/class-reminders/route";
import { db } from "../lib/db";

// Helper to base64url decode
function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ""}`);
    failedCount++;
  }
}

async function runPhase1Tests() {
  console.log("=================================================================");
  console.log(" SELFFITS Push Notification Phase 1 — Automated Test Suite");
  console.log("=================================================================\n");

  // Generate a live RSA keypair for testing Google OAuth2 service account signatures
  const { privateKey: rsaPrivateKey, publicKey: rsaPublicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  const testProjectId = "selffits-test-project";
  const testClientEmail = "test-service-account@selffits-test-project.iam.gserviceaccount.com";

  // Mock database models so unit tests run cleanly without requiring an active PostgreSQL connection
  (db.websiteSettings as any).upsert = async () => ({}) as any;
  (db.websiteSettings as any).findUnique = async () => null as any;
  (db.user as any).findMany = async () => [];
  (db.notification as any).create = async () => ({}) as any;

  // -------------------------------------------------------------
  // Test 1: Missing Configuration Fail-Safe
  // -------------------------------------------------------------
  console.log("Section 1: Configuration & Missing Credentials Handling");

  {
    const unconfiguredProvider = new FirebasePushProvider({
      projectId: null,
      clientEmail: null,
      privateKey: null,
    });

    assert(
      unconfiguredProvider.configured === false,
      "Provider correctly reports configured === false when credentials are null"
    );

    const result = await unconfiguredProvider.send(
      [
        {
          token: "dummy-token-12345",
          userId: "user-1",
          role: "STUDENT",
          platform: "android",
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        },
      ],
      { title: "Test", body: "Hello", data: { type: "ANNOUNCEMENT" } }
    );

    assert(
      result.success === false &&
        result.failureCount === 1 &&
        result.errors.some((e) => e.includes("FIREBASE_NOT_CONFIGURED")),
      "Safely rejects push dispatch with FIREBASE_NOT_CONFIGURED error without crashing"
    );

    // Whitespace trimming test
    const paddedProvider = new FirebasePushProvider({
      projectId: "  selffits-whitespace-proj  ",
      clientEmail: "  service-acct@selffits.iam.gserviceaccount.com  ",
      privateKey: rsaPrivateKey,
      fetchFn: async () => new Response("ok"),
    });

    assert(
      paddedProvider.getProjectId() === "selffits-whitespace-proj",
      "Safely trims leading and trailing whitespace from FIREBASE_PROJECT_ID and FIREBASE_CLIENT_EMAIL"
    );
  }

  // -------------------------------------------------------------
  // Test 2: Invalid Private Key Format Handling
  // -------------------------------------------------------------
  console.log("\nSection 2: Invalid Credentials Handling");

  {
    const invalidKeyProvider = new FirebasePushProvider({
      projectId: testProjectId,
      clientEmail: testClientEmail,
      privateKey: "NOT_A_VALID_PEM_KEY",
      fetchFn: async () => new Response("ok"),
    });

    assert(
      invalidKeyProvider.configured === true,
      "Reports configured === true based on presence of non-empty strings"
    );

    const result = await invalidKeyProvider.send(
      [
        {
          token: "dummy-token-12345",
          userId: "user-1",
          role: "STUDENT",
          platform: "ios",
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        },
      ],
      { title: "Test", body: "Hello", data: { type: "ANNOUNCEMENT" } }
    );

    assert(
      result.success === false &&
        result.failureCount === 1 &&
        result.errors.some((e) => e.includes("FCM_AUTH_ERROR") && e.includes("Failed to sign")),
      "Gracefully handles malformed RSA private key during JWT signing without crashing server"
    );
  }

  // -------------------------------------------------------------
  // Test 3: OAuth2 JWT Assertion Generation & Token Exchange
  // -------------------------------------------------------------
  console.log("\nSection 3: Native OAuth2 Assertion Generation & Verification");

  {
    let oauthRequestUrl = "";
    let oauthRequestBody = "";
    let oauthRequestHeaders: Record<string, string> = {};

    const mockFetch: typeof fetch = async (url, init) => {
      oauthRequestUrl = url.toString();
      oauthRequestBody = init?.body ? String(init.body) : "";
      oauthRequestHeaders = (init?.headers as Record<string, string>) || {};

      return new Response(
        JSON.stringify({
          access_token: "mock-oauth2-access-token-xyz987",
          token_type: "Bearer",
          expires_in: 3600,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const provider = new FirebasePushProvider({
      projectId: testProjectId,
      clientEmail: testClientEmail,
      privateKey: rsaPrivateKey,
      fetchFn: mockFetch,
    });

    const token = await provider.getAccessToken();

    assert(token === "mock-oauth2-access-token-xyz987", "Successfully exchanges JWT for OAuth2 access token");
    assert(oauthRequestUrl === "https://oauth2.googleapis.com/token", "Calls standard Google OAuth2 token endpoint");
    assert(
      oauthRequestBody.includes("grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer"),
      "Specifies urn:ietf:params:oauth:grant-type:jwt-bearer grant type"
    );

    // Extract assertion from request body
    const match = oauthRequestBody.match(/assertion=([^&]+)/);
    assert(Boolean(match), "Request body contains assertion parameter");

    if (match) {
      const assertion = decodeURIComponent(match[1]);
      const parts = assertion.split(".");
      assert(parts.length === 3, "Assertion has standard 3-part JWT structure (header.payload.signature)");

      const header = JSON.parse(base64urlDecode(parts[0]));
      const payload = JSON.parse(base64urlDecode(parts[1]));

      assert(header.alg === "RS256" && header.typ === "JWT", "JWT header specifies RS256 algorithm");
      assert(payload.iss === testClientEmail, "JWT issuer matches FIREBASE_CLIENT_EMAIL");
      assert(
        payload.scope === "https://www.googleapis.com/auth/firebase.messaging",
        "JWT scope is strictly https://www.googleapis.com/auth/firebase.messaging"
      );
      assert(payload.aud === "https://oauth2.googleapis.com/token", "JWT audience is Google token endpoint");
      assert(payload.exp - payload.iat === 3600, "JWT has standard 1-hour expiration lifetime");

      // Cryptographically verify signature with public key
      const verifier = crypto.createVerify("RSA-SHA256");
      verifier.update(`${parts[0]}.${parts[1]}`);
      const sigBuffer = Buffer.from(parts[2].replace(/-/g, "+").replace(/_/g, "/"), "base64");
      const isSignatureValid = verifier.verify(rsaPublicKey, sigBuffer);

      assert(isSignatureValid, "JWT signature is cryptographically valid against service account RSA key");
    }
  }

  // -------------------------------------------------------------
  // Test 4: Access Token In-Memory Caching
  // -------------------------------------------------------------
  console.log("\nSection 4: In-Memory Access Token Caching");

  {
    let oauthCallCount = 0;

    const mockFetch: typeof fetch = async (url) => {
      if (url.toString().includes("oauth2.googleapis.com/token")) {
        oauthCallCount++;
        return new Response(
          JSON.stringify({
            access_token: "cached-token-111",
            token_type: "Bearer",
            expires_in: 3600,
          }),
          { status: 200 }
        );
      }
      return new Response("{}", { status: 200 });
    };

    const provider = new FirebasePushProvider({
      projectId: testProjectId,
      clientEmail: testClientEmail,
      privateKey: rsaPrivateKey,
      fetchFn: mockFetch,
    });

    const token1 = await provider.getAccessToken();
    const token2 = await provider.getAccessToken();

    assert(
      token1 === token2 && oauthCallCount === 1,
      "Reuses cached access token without making redundant network requests"
    );

    // Reset cache and verify it re-fetches
    provider._resetAccessTokenCache();
    const token3 = await provider.getAccessToken();

    assert(
      token3 === "cached-token-111" && oauthCallCount === 2,
      "Refetches token when cache expires or is reset"
    );
  }

  // -------------------------------------------------------------
  // Test 5: Successful FCM v1 Push Delivery
  // -------------------------------------------------------------
  console.log("\nSection 5: FCM HTTP v1 Message Delivery & Payload Formatting");

  {
    let fcmEndpointUrl = "";
    let fcmHeaders: Record<string, string> = {};
    let fcmBody: any = null;

    const mockFetch: typeof fetch = async (url, init) => {
      const urlStr = url.toString();
      if (urlStr.includes("oauth2.googleapis.com/token")) {
        return new Response(
          JSON.stringify({
            access_token: "active-fcm-bearer-token",
            expires_in: 3600,
          }),
          { status: 200 }
        );
      }

      if (urlStr.includes("messages:send")) {
        fcmEndpointUrl = urlStr;
        fcmHeaders = (init?.headers as Record<string, string>) || {};
        fcmBody = JSON.parse(String(init?.body || "{}"));

        return new Response(
          JSON.stringify({
            name: "projects/selffits-test-project/messages/msg-test-successful-001",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response("{}", { status: 200 });
    };

    const provider = new FirebasePushProvider({
      projectId: testProjectId,
      clientEmail: testClientEmail,
      privateKey: rsaPrivateKey,
      fetchFn: mockFetch,
    });

    const testTokens = [
      {
        token: "fcm-device-registered-student-001",
        userId: "student-123",
        role: "STUDENT",
        platform: "android" as const,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      },
    ];

    const result = await provider.send(testTokens, {
      title: "🥋 Live Class in 15 Minutes!",
      body: "Muay Thai Fundamentals with Coach Alex starts soon.",
      data: {
        type: "CLASS_REMINDER",
        batchId: "batch-muay-thai-1",
        deepLink: "selffits://class/live?batchId=batch-muay-thai-1",
      },
    });

    assert(result.success === true, "Reports success: true for HTTP 200 FCM delivery");
    assert(result.successCount === 1 && result.failureCount === 0, "Reports successCount: 1, failureCount: 0");
    assert(
      fcmEndpointUrl === `https://fcm.googleapis.com/v1/projects/${testProjectId}/messages:send`,
      "Dispatches to correct FCM v1 project messages:send URL"
    );
    assert(
      fcmHeaders["Authorization"] === "Bearer active-fcm-bearer-token",
      "Supplies Authorization: Bearer <accessToken> header"
    );
    assert(
      fcmBody?.message?.token === "fcm-device-registered-student-001",
      "Message contains target device token"
    );
    assert(
      fcmBody?.message?.notification?.title === "🥋 Live Class in 15 Minutes!",
      "Message contains notification title"
    );
    assert(
      fcmBody?.message?.android?.notification?.channelId === "selffits_high_importance_channel" &&
        fcmBody?.message?.android?.priority === "high",
      "Configures Android high-importance channel and high priority"
    );
    assert(
      fcmBody?.message?.apns?.payload?.aps?.alert?.title === "🥋 Live Class in 15 Minutes!" &&
        fcmBody?.message?.apns?.payload?.aps?.badge === 1,
      "Configures APNs alert payload and badge count"
    );
    assert(
      fcmBody?.message?.apns?.payload?.aps?.["content-available"] === 1 &&
        fcmBody?.message?.apns?.payload?.aps?.contentAvailable === undefined,
      "APNs aps dictionary strictly uses kebab-case 'content-available: 1' instead of camelCase"
    );
    assert(
      typeof fcmBody?.message?.data?.type === "string" &&
        fcmBody?.message?.data?.click_action === "FLUTTER_NOTIFICATION_CLICK",
      "Custom data dictionary attributes are strictly serialized as strings with FLUTTER_NOTIFICATION_CLICK"
    );
  }

  // -------------------------------------------------------------
  // Test 6: FCM Unregistered Token Detection & Automatic Pruning
  // -------------------------------------------------------------
  console.log("\nSection 6: Invalid/Unregistered Token Detection & Pruning Contract");

  {
    const unregisteredToken = "fcm-token-dead-or-uninstalled-999";
    const validToken = "fcm-token-active-live-888";

    const mockFetch: typeof fetch = async (url, init) => {
      const urlStr = url.toString();
      if (urlStr.includes("oauth2.googleapis.com/token")) {
        return new Response(JSON.stringify({ access_token: "tok", expires_in: 3600 }), { status: 200 });
      }

      const body = JSON.parse(String(init?.body || "{}"));
      if (body?.message?.token === unregisteredToken) {
        return new Response(
          JSON.stringify({
            error: {
              code: 404,
              message: "Requested entity was not found.",
              status: "NOT_FOUND",
              details: [
                {
                  "@type": "type.googleapis.com/google.firebase.fcm.v1.FcmError",
                  errorCode: "UNREGISTERED",
                },
              ],
            },
          }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ name: "projects/p/messages/ok" }), { status: 200 });
    };

    const provider = new FirebasePushProvider({
      projectId: testProjectId,
      clientEmail: testClientEmail,
      privateKey: rsaPrivateKey,
      fetchFn: mockFetch,
    });

    const sendResult = await provider.send(
      [
        {
          token: unregisteredToken,
          userId: "user-stale",
          role: "STUDENT",
          platform: "android",
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        },
        {
          token: validToken,
          userId: "user-active",
          role: "STUDENT",
          platform: "ios",
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        },
      ],
      { title: "Test", body: "Hello", data: { type: "ANNOUNCEMENT" } }
    );

    assert(sendResult.success === false, "Reports overall success: false due to unregistered token failure");
    assert(sendResult.successCount === 1, "Correctly tracks successCount: 1 for the valid token");
    assert(sendResult.failureCount === 1, "Correctly tracks failureCount: 1 for the invalid token");
    assert(
      sendResult.invalidTokens.includes(unregisteredToken),
      "Correctly identifies and collects unregistered token in invalidTokens array"
    );
    assert(
      !sendResult.invalidTokens.includes(validToken),
      "Does not mistakenly flag valid token as invalid"
    );

    // Verify token pruning contract on DeviceTokenStore
    await DeviceTokenStore._resetForTesting();
    await DeviceTokenStore.registerToken({
      userId: "user-stale",
      role: "STUDENT",
      token: unregisteredToken,
      platform: "android",
    });

    let tokensBefore = await DeviceTokenStore.getUserTokens("user-stale");
    assert(tokensBefore.length === 1, "Registered unregisteredToken in store before pruning");

    const prunedCount = await DeviceTokenStore.pruneInvalidTokens(sendResult.invalidTokens);
    let tokensAfter = await DeviceTokenStore.getUserTokens("user-stale");

    assert(prunedCount === 1 && tokensAfter.length === 0, "Successfully pruned unregistered token from store");

    // REGRESSION TEST: Generic 400 INVALID_ARGUMENT caused by malformed payload must NOT prune valid device tokens
    {
      const validDeviceToken = "valid-fcm-token-recipient-xyz";
      await DeviceTokenStore._resetForTesting();
      await DeviceTokenStore.registerToken({
        userId: "user-valid-recipient",
        role: "STUDENT",
        token: validDeviceToken,
        platform: "android",
      });

      // Mock FCM returning 400 INVALID_ARGUMENT for a malformed payload (e.g. invalid JSON field)
      const mockFetchPayloadError: typeof fetch = async (url) => {
        if (url.toString().includes("oauth2.googleapis.com/token")) {
          return new Response(JSON.stringify({ access_token: "tok", expires_in: 3600 }), { status: 200 });
        }

        return new Response(
          JSON.stringify({
            error: {
              code: 400,
              message: "Invalid JSON payload received. Unknown name 'badParameter' at 'message.data'.",
              status: "INVALID_ARGUMENT",
              details: [
                {
                  "@type": "type.googleapis.com/google.protobuf.FieldViolation",
                  field: "message.data.badParameter",
                  description: "Invalid field",
                },
              ],
            },
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      };

      const payloadErrorProvider = new FirebasePushProvider({
        projectId: testProjectId,
        clientEmail: testClientEmail,
        privateKey: rsaPrivateKey,
        fetchFn: mockFetchPayloadError,
      });

      const payloadErrorResult = await payloadErrorProvider.send(
        [
          {
            token: validDeviceToken,
            userId: "user-valid-recipient",
            role: "STUDENT",
            platform: "android",
            createdAt: new Date().toISOString(),
            lastUsedAt: new Date().toISOString(),
          },
        ],
        { title: "Test", body: "Hello", data: { type: "ANNOUNCEMENT" } }
      );

      assert(
        payloadErrorResult.success === false && payloadErrorResult.failureCount === 1,
        "FCM payload validation error is reported as a delivery failure"
      );
      assert(
        payloadErrorResult.invalidTokens.length === 0,
        "REGRESSION: Generic 400 INVALID_ARGUMENT payload error does NOT mark valid token as invalid"
      );

      // Verify token remains registered in store
      const tokensStillActive = await DeviceTokenStore.getUserTokens("user-valid-recipient");
      assert(
        tokensStillActive.length === 1 && tokensStillActive[0].token === validDeviceToken,
        "REGRESSION: Valid device token is NOT pruned when FCM rejects due to malformed payload"
      );
    }

    // TEST: Specific 400 INVALID_ARGUMENT for malformed registration token IS pruned
    {
      const malformedToken = "not-a-valid-token-string";
      await DeviceTokenStore._resetForTesting();
      await DeviceTokenStore.registerToken({
        userId: "user-malformed",
        role: "STUDENT",
        token: malformedToken,
        platform: "ios",
      });

      const mockFetchTokenError: typeof fetch = async (url) => {
        if (url.toString().includes("oauth2.googleapis.com/token")) {
          return new Response(JSON.stringify({ access_token: "tok", expires_in: 3600 }), { status: 200 });
        }

        return new Response(
          JSON.stringify({
            error: {
              code: 400,
              message: "The registration token is not a valid FCM registration token",
              status: "INVALID_ARGUMENT",
              details: [
                {
                  "@type": "type.googleapis.com/google.firebase.fcm.v1.FcmError",
                  errorCode: "INVALID_ARGUMENT",
                },
              ],
            },
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      };

      const tokenErrorProvider = new FirebasePushProvider({
        projectId: testProjectId,
        clientEmail: testClientEmail,
        privateKey: rsaPrivateKey,
        fetchFn: mockFetchTokenError,
      });

      const tokenErrorResult = await tokenErrorProvider.send(
        [
          {
            token: malformedToken,
            userId: "user-malformed",
            role: "STUDENT",
            platform: "ios",
            createdAt: new Date().toISOString(),
            lastUsedAt: new Date().toISOString(),
          },
        ],
        { title: "Test", body: "Hello", data: { type: "ANNOUNCEMENT" } }
      );

      assert(
        tokenErrorResult.invalidTokens.includes(malformedToken),
        "Identifies and collects malformed token when error specifically identifies registration token"
      );

      await DeviceTokenStore.pruneInvalidTokens(tokenErrorResult.invalidTokens);
      const tokensPruned = await DeviceTokenStore.getUserTokens("user-malformed");
      assert(tokensPruned.length === 0, "Malformed registration token is pruned from store");
    }
  }

  // -------------------------------------------------------------
  // Test 7: FCM Provider Server Error (500) Handling
  // -------------------------------------------------------------
  console.log("\nSection 7: Server Error & Network Failure Resilience");

  {
    const mockFetch: typeof fetch = async (url) => {
      if (url.toString().includes("oauth2.googleapis.com/token")) {
        return new Response(JSON.stringify({ access_token: "tok", expires_in: 3600 }), { status: 200 });
      }
      return new Response(
        JSON.stringify({
          error: { code: 500, message: "Internal server error occurred at Google FCM gateway", status: "INTERNAL" },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    };

    const provider = new FirebasePushProvider({
      projectId: testProjectId,
      clientEmail: testClientEmail,
      privateKey: rsaPrivateKey,
      fetchFn: mockFetch,
    });

    const res = await provider.send(
      [
        {
          token: "fcm-tok-temp-fail",
          userId: "user-1",
          role: "STUDENT",
          platform: "android",
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        },
      ],
      { title: "Test", body: "Hello", data: { type: "ANNOUNCEMENT" } }
    );

    assert(res.success === false && res.failureCount === 1, "Correctly flags delivery failure on HTTP 500");
    assert(
      res.invalidTokens.length === 0,
      "Does NOT treat temporary HTTP 500 server errors as invalid/unregistered tokens"
    );
  }

  // -------------------------------------------------------------
  // Test 8: Cron Authorization Security (Fail-Closed)
  // -------------------------------------------------------------
  console.log("\nSection 8: Cron Security (Fail-Closed Verification for GET and POST)");

  {
    const originalSecret = process.env.CRON_SECRET;

    // A. When CRON_SECRET is NOT set: Both GET and POST must fail closed with 401
    delete process.env.CRON_SECRET;

    const reqNoConfigGet = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "GET",
    });
    const resNoConfigGet = await cronGet(reqNoConfigGet);
    const bodyNoConfigGet = await resNoConfigGet.json();

    assert(
      resNoConfigGet.status === 401 && bodyNoConfigGet.error?.code === "UNAUTHORIZED_CRON",
      "GET rejects with 401 UNAUTHORIZED_CRON when CRON_SECRET is unconfigured (fail closed)"
    );

    const reqNoConfigPost = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "POST",
    });
    const resNoConfigPost = await cronPost(reqNoConfigPost);
    const bodyNoConfigPost = await resNoConfigPost.json();

    assert(
      resNoConfigPost.status === 401 && bodyNoConfigPost.error?.code === "UNAUTHORIZED_CRON",
      "POST rejects with 401 UNAUTHORIZED_CRON when CRON_SECRET is unconfigured (fail closed)"
    );

    // B. When CRON_SECRET is configured:
    process.env.CRON_SECRET = "super-secret-cron-token-9999";

    // B1. Request missing secret header
    const reqMissingSecret = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "GET",
    });
    const resMissingSecret = await cronGet(reqMissingSecret);
    assert(resMissingSecret.status === 401, "GET rejects missing authorization when CRON_SECRET is configured (401)");

    const reqMissingSecretPost = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "POST",
    });
    const resMissingSecretPost = await cronPost(reqMissingSecretPost);
    assert(resMissingSecretPost.status === 401, "POST rejects missing authorization when CRON_SECRET is configured (401)");

    // B2. Request with invalid secret
    const reqInvalidSecret = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "GET",
      headers: { Authorization: "Bearer wrong-secret" },
    });
    const resInvalidSecret = await cronGet(reqInvalidSecret);
    assert(resInvalidSecret.status === 401, "GET rejects wrong Authorization secret header (401)");

    // B2a. Request with unequal length secret (shorter)
    const reqShorterSecret = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "GET",
      headers: { Authorization: "Bearer short" },
    });
    const resShorterSecret = await cronGet(reqShorterSecret);
    assert(resShorterSecret.status === 401, "GET rejects shorter secret without timing leak or throwing (401)");

    // B2b. Request with unequal length secret (longer)
    const reqLongerSecret = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "POST",
      headers: { Authorization: "Bearer super-secret-cron-token-9999-longer-overflow" },
    });
    const resLongerSecret = await cronPost(reqLongerSecret);
    assert(resLongerSecret.status === 401, "POST rejects longer secret without timing leak or throwing (401)");

    // B2c. Request with equal length but incorrect characters
    const reqSameLenSecret = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "GET",
      headers: { Authorization: "Bearer super-secret-cron-token-0000" },
    });
    const resSameLenSecret = await cronGet(reqSameLenSecret);
    assert(resSameLenSecret.status === 401, "GET rejects same-length secret with mismatched bytes via timingSafeEqual (401)");

    // B2d. Request with empty Bearer token
    const reqEmptyBearer = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "GET",
      headers: { Authorization: "Bearer " },
    });
    const resEmptyBearer = await cronGet(reqEmptyBearer);
    assert(resEmptyBearer.status === 401, "GET rejects empty Bearer authorization (401)");

    // Mock db.batch.findMany to return an empty array for cron scanning
    (db.batch as any).findMany = async () => [];

    // B3. Request with custom header x-cron-secret (invalid)
    const reqInvalidCustomHeader = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "POST",
      headers: { "x-cron-secret": "wrong-secret" },
    });
    const resInvalidCustomHeader = await cronPost(reqInvalidCustomHeader);
    assert(resInvalidCustomHeader.status === 401, "POST rejects wrong x-cron-secret header (401)");

    // B4. Request with valid Authorization: Bearer <secret> (GET)
    const reqValidBearerGet = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "GET",
      headers: { Authorization: "Bearer super-secret-cron-token-9999" },
    });
    const resValidBearerGet = await cronGet(reqValidBearerGet);
    assert(resValidBearerGet.status === 200, "GET authorizes successfully with valid Authorization Bearer secret (200)");

    // B5. Request with valid x-cron-secret header (POST)
    const reqValidCustomPost = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "POST",
      headers: { "x-cron-secret": "super-secret-cron-token-9999" },
    });
    const resValidCustomPost = await cronPost(reqValidCustomPost);
    assert(resValidCustomPost.status === 200, "POST authorizes successfully with valid x-cron-secret header (200)");

    // B6. Request with valid x-cron-secret with surrounding whitespace (POST)
    const reqWhitespaceSecretPost = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "POST",
      headers: { "x-cron-secret": "  super-secret-cron-token-9999  " },
    });
    const resWhitespaceSecretPost = await cronPost(reqWhitespaceSecretPost);
    assert(resWhitespaceSecretPost.status === 200, "POST safely trims and authorizes header with whitespace padding (200)");

    // Clean up environment
    if (originalSecret !== undefined) {
      process.env.CRON_SECRET = originalSecret;
    } else {
      delete process.env.CRON_SECRET;
    }
  }

  // -------------------------------------------------------------
  // Test 9: Deduplication & Token Ownership Isolation
  // -------------------------------------------------------------
  console.log("\nSection 9: Deduplication & Token Isolation");

  {
    const mockProvider = new FirebasePushProvider({
      projectId: testProjectId,
      clientEmail: testClientEmail,
      privateKey: rsaPrivateKey,
      fetchFn: async () => new Response(JSON.stringify({ name: "ok" }), { status: 200 }),
    });
    const pushService = new PushNotificationService(mockProvider);
    pushService._clearDedupCache();

    // First reminder
    const firstReminder = await pushService.sendClassReminder({
      batchId: "batch-test-dedup",
      batchName: "BJJ Advanced",
      coachName: "Coach Marcus",
      startTimeStr: "06:00 PM (GMT)",
      userIds: ["user-dedup-1"],
      dateStr: "2026-10-28",
    });

    assert(firstReminder.deduplicated !== true, "Initial class reminder is dispatched (not deduplicated)");

    // Immediate duplicate reminder for identical batch + date
    const secondReminder = await pushService.sendClassReminder({
      batchId: "batch-test-dedup",
      batchName: "BJJ Advanced",
      coachName: "Coach Marcus",
      startTimeStr: "06:00 PM (GMT)",
      userIds: ["user-dedup-1"],
      dateStr: "2026-10-28",
    });

    assert(
      secondReminder.deduplicated === true && secondReminder.success === true,
      "Duplicate class reminder within same date/window is safely suppressed with deduplicated: true"
    );

    // Verify token re-registration ownership transfer (prevents cross-user notification leakage)
    await DeviceTokenStore._resetForTesting();
    const sharedToken = "device-hardware-token-shared-xyz";

    await DeviceTokenStore.registerToken({
      userId: "user-alpha",
      role: "STUDENT",
      token: sharedToken,
      platform: "android",
    });

    const alphaTokens = await DeviceTokenStore.getUserTokens("user-alpha");
    assert(alphaTokens.length === 1, "Token registered to User Alpha initially");

    // Account switch: User Beta logs in on same device with same hardware push token
    await DeviceTokenStore.registerToken({
      userId: "user-beta",
      role: "STUDENT",
      token: sharedToken,
      platform: "android",
    });

    const alphaTokensAfter = await DeviceTokenStore.getUserTokens("user-alpha");
    const betaTokens = await DeviceTokenStore.getUserTokens("user-beta");

    assert(
      alphaTokensAfter.length === 0 && betaTokens.length === 1,
      "Token ownership cleanly transfers to new user upon login, isolating notifications"
    );
  }

  console.log("\n=================================================================");
  console.log(` Phase 1 Test Execution Summary: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("=================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase1Tests().catch((err) => {
  console.error("Test execution encountered an unhandled exception:", err);
  process.exit(1);
});
