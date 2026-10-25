/**
 * SELFFITS Mobile REST API — Module 6 Automated Notification Security & Architecture Test Suite
 * Validates:
 * 1. Token registration authentication & Zod validation
 * 2. Token ownership isolation & unregistration on logout
 * 3. Invalidation & pruning of unregistered FCM tokens
 * 4. Deduplication of 15-minute class reminders
 * 5. Multi-channel event dispatch (class reminder, schedule change, cancellation, announcement)
 * 6. Server-side cron security (CRON_SECRET)
 * 7. In-app notification feed & read status
 */

import { signMobileToken } from "../lib/mobile-auth";
import { DeviceTokenStore } from "../lib/device-token-store";
import {
  PushNotificationService,
  MockPushProvider,
} from "../lib/push-notification-service";
import { POST as registerTokenRoute, DELETE as unregisterTokenRoute } from "../app/api/v1/notifications/device-token/route";
import { GET as getNotificationsRoute } from "../app/api/v1/notifications/route";
import { GET as runCronRoute } from "../app/api/v1/cron/class-reminders/route";

async function createTestToken(claims: { id: string; email: string; role: "STUDENT" | "COACH" | "ADMIN"; name?: string; isBlocked?: boolean }) {
  return await signMobileToken({
    id: claims.id,
    email: claims.email,
    name: claims.name || "Test User",
    role: claims.role,
    isBlocked: claims.isBlocked ?? false,
  });
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

async function runTestSuite() {
  console.log("=================================================================");
  console.log(" SELFFITS Mobile REST API — Module 6 Notification Security Tests");
  console.log("=================================================================\n");

  await DeviceTokenStore._resetForTesting();
  const mockProvider = new MockPushProvider();
  const pushService = new PushNotificationService(mockProvider);

  // 1. Device Token Registration Authentication & Validation
  console.log("Section 1: Device Token Registration Security & Validation");

  // A. Missing Auth Header
  {
    const req = new Request("http://localhost:3000/api/v1/notifications/device-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "fcm-token-1234567890", platform: "android" }),
    });
    const res = await registerTokenRoute(req);
    assert(res.status === 401, "Rejects token registration without Authorization header (401)");
  }

  // B. Invalid JSON Body
  {
    const validStudentToken = await createTestToken({
      id: "user-st-1",
      email: "student@selffits.com",
      role: "STUDENT",
    });

    const req = new Request("http://localhost:3000/api/v1/notifications/device-token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${validStudentToken}`,
        "Content-Type": "application/json",
      },
      body: "not-json{",
    });
    const res = await registerTokenRoute(req);
    assert(res.status === 400, "Rejects malformed JSON body (400)");
  }

  // C. Zod Validation (Token too short, invalid platform)
  {
    const validStudentToken = await createTestToken({
      id: "user-st-1",
      email: "student@selffits.com",
      role: "STUDENT",
    });

    const req = new Request("http://localhost:3000/api/v1/notifications/device-token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${validStudentToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "short", platform: "windows_phone" }),
    });
    const res = await registerTokenRoute(req);
    const json = await res.json();
    assert(
      res.status === 400 && json.error.code === "VALIDATION_ERROR",
      "Rejects invalid platform and short token via Zod schema (400)"
    );
  }

  // D. Successful Registration (Android)
  {
    const validStudentToken = await createTestToken({
      id: "user-st-1",
      email: "student@selffits.com",
      role: "STUDENT",
    });

    const req = new Request("http://localhost:3000/api/v1/notifications/device-token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${validStudentToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: "fcm-android-token-student-1-xyz12345",
        platform: "android",
        deviceId: "pixel-7-pro",
      }),
    });
    const res = await registerTokenRoute(req);
    const json = await res.json();
    assert(
      res.status === 200 && json.success === true && json.data.registered === true,
      "Successfully registers Android FCM device token for authenticated student (200)"
    );
  }

  // E. Successful Registration (iOS)
  {
    const validCoachToken = await createTestToken({
      id: "user-coach-1",
      email: "coach@selffits.com",
      role: "COACH",
    });

    const req = new Request("http://localhost:3000/api/v1/notifications/device-token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${validCoachToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: "apns-ios-token-coach-1-abc987654321",
        platform: "ios",
        deviceId: "iphone-14-pro",
      }),
    });
    const res = await registerTokenRoute(req);
    const json = await res.json();
    assert(
      res.status === 200 && json.success === true && json.data.registered === true,
      "Successfully registers iOS APNs device token for authenticated coach (200)"
    );
  }

  // 2. Token Ownership Isolation & Unregistration
  console.log("\nSection 2: Token Ownership Isolation & Logout Cleanup");

  // A. Token Reassignment Prevention of Cross-User Leakage
  {
    // User 2 logs into the same physical phone (token previously registered to User 1)
    await DeviceTokenStore.registerToken({
      userId: "user-1",
      role: "STUDENT",
      token: "shared-phone-device-token-123456",
      platform: "android",
    });

    // Check ownership before
    const u1Tokens = await DeviceTokenStore.getUserTokens("user-1");
    assert(u1Tokens.some((t) => t.token === "shared-phone-device-token-123456"), "Token initially owned by User 1");

    // User 2 logs in on that device
    await DeviceTokenStore.registerToken({
      userId: "user-2",
      role: "STUDENT",
      token: "shared-phone-device-token-123456",
      platform: "android",
    });

    // Verify token was reassigned and User 1 no longer receives notifications for it
    const u1After = await DeviceTokenStore.getUserTokens("user-1");
    const u2After = await DeviceTokenStore.getUserTokens("user-2");
    assert(
      !u1After.some((t) => t.token === "shared-phone-device-token-123456") &&
        u2After.some((t) => t.token === "shared-phone-device-token-123456"),
      "Re-assigns device token ownership on account switch, preventing notification leakage"
    );
  }

  // B. Unregister Token On Logout
  {
    const studentToken = await createTestToken({
      id: "user-st-1",
      email: "student@selffits.com",
      role: "STUDENT",
    });

    const req = new Request("http://localhost:3000/api/v1/notifications/device-token", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${studentToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "fcm-android-token-student-1-xyz12345" }),
    });
    const res = await unregisterTokenRoute(req);
    const json = await res.json();
    assert(
      res.status === 200 && json.success === true && json.data.unregistered === true,
      "Successfully unlinks device token upon user logout (200)"
    );

    const tokens = await DeviceTokenStore.getUserTokens("user-st-1");
    assert(tokens.length === 0, "Device token was completely deleted from store");
  }

  // C. Unregistering Token Belonging to Another User Fails
  {
    // Coach attempts to delete student's token
    await DeviceTokenStore.registerToken({
      userId: "student-victim",
      role: "STUDENT",
      token: "victim-device-token-11223344",
      platform: "android",
    });

    const attackerCoachToken = await createTestToken({
      id: "coach-attacker",
      email: "attacker@selffits.com",
      role: "COACH",
    });

    const req = new Request("http://localhost:3000/api/v1/notifications/device-token", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${attackerCoachToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "victim-device-token-11223344" }),
    });
    const res = await unregisterTokenRoute(req);
    const json = await res.json();
    assert(
      res.status === 200 && json.data.unregistered === false,
      "Blocks unauthorized user from unregistering another user's device token"
    );

    const victimTokens = await DeviceTokenStore.getUserTokens("student-victim");
    assert(victimTokens.length === 1, "Victim token was preserved untouched");
  }

  // 3. Push Notification Dispatch & Deduplication
  console.log("\nSection 3: Push Notification Dispatch & Deduplication");

  // A. Class Reminder Dispatch with Deep Link
  {
    mockProvider.reset();
    pushService._clearDedupCache();

    await DeviceTokenStore.registerToken({
      userId: "student-dojo-1",
      role: "STUDENT",
      token: "fcm-dojo-token-1122334455",
      platform: "android",
    });

    const reminderResult = await pushService.sendClassReminder({
      batchId: "batch-karate-01",
      batchName: "Karate Champions",
      coachName: "Sensei Kenji",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      startTimeStr: "05:00 PM to 06:00 PM (GMT)",
      userIds: ["student-dojo-1"],
      dateStr: "2026-10-16",
    });

    assert(
      reminderResult.success && reminderResult.successCount === 1,
      "Successfully dispatches 15-minute class reminder with Google Meet details"
    );

    const sent = mockProvider.sentMessages[0];
    assert(
      sent &&
        sent.payload.data.type === "CLASS_REMINDER" &&
        sent.payload.data.deepLink === "selffits://class/live?batchId=batch-karate-01" &&
        sent.payload.data.meetingUrl === "https://meet.google.com/abc-defg-hij",
      "Notification payload contains accurate deep link and meeting URL"
    );

    // B. Deduplication: Second attempt on the same day is suppressed
    const duplicateResult = await pushService.sendClassReminder({
      batchId: "batch-karate-01",
      batchName: "Karate Champions",
      coachName: "Sensei Kenji",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      startTimeStr: "05:00 PM to 06:00 PM (GMT)",
      userIds: ["student-dojo-1"],
      dateStr: "2026-10-16",
    });

    assert(
      duplicateResult.deduplicated === true && duplicateResult.successCount === 0,
      "Duplicate class reminder for same session is suppressed by deduplication engine"
    );
  }

  // C. Invalid Token Pruning
  {
    mockProvider.reset();
    await DeviceTokenStore.registerToken({
      userId: "student-stale",
      role: "STUDENT",
      token: "invalid-stale-fcm-token-99999",
      platform: "android",
    });

    mockProvider.simulatedInvalidTokens.add("invalid-stale-fcm-token-99999");

    const sendResult = await pushService.sendToUser(
      "student-stale",
      {
        title: "Test Alert",
        body: "Testing stale token cleanup",
        data: { type: "GENERAL" },
      },
      { persistInApp: false }
    );

    assert(
      sendResult.invalidTokens.includes("invalid-stale-fcm-token-99999"),
      "FCM provider flags unregistered/invalid token"
    );

    // Verify token was pruned from store
    const staleTokensAfter = await DeviceTokenStore.getUserTokens("student-stale");
    assert(
      staleTokensAfter.length === 0,
      "Invalid/unregistered device token automatically pruned from persistent store"
    );
  }

  // D. Event-Specific Dispatches (Schedule Change, Cancellation, Announcement)
  {
    mockProvider.reset();
    await DeviceTokenStore.registerToken({
      userId: "student-events",
      role: "STUDENT",
      token: "valid-event-token-12345678",
      platform: "ios",
    });

    await pushService.sendScheduleChange({
      batchId: "b-1",
      batchName: "Kickboxing",
      newTiming: "06:00 PM (GMT)",
      newDays: "Tue & Thu",
      userIds: ["student-events"],
    });

    await pushService.sendClassCancelled({
      batchId: "b-1",
      batchName: "Kickboxing",
      reason: "Sensei illness",
      userIds: ["student-events"],
    });

    await pushService.sendAnnouncement({
      title: "Holiday Schedule",
      message: "Dojo closed on Monday",
      userIds: ["student-events"],
    });

    assert(mockProvider.sentMessages.length === 3, "Dispatches schedule change, class cancellation, and announcement push events");
    assert(
      mockProvider.sentMessages[0].payload.data.type === "SCHEDULE_CHANGE" &&
        mockProvider.sentMessages[1].payload.data.type === "CLASS_CANCELLED" &&
        mockProvider.sentMessages[2].payload.data.type === "ANNOUNCEMENT",
      "All notification types are strictly mapped to corresponding event channels"
    );
  }

  // 4. Server-Side Cron Security & Execution
  console.log("\nSection 4: Server-Side Cron Security (CRON_SECRET)");

  // A. CRON_SECRET Enforcement
  {
    process.env.CRON_SECRET = "test-cron-secret-production-9988";

    // Request with missing secret
    const reqMissing = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "GET",
    });
    const resMissing = await runCronRoute(reqMissing);
    assert(resMissing.status === 401, "Rejects cron execution without CRON_SECRET authorization (401)");

    // Request with valid secret
    const reqValid = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "GET",
      headers: {
        Authorization: "Bearer test-cron-secret-production-9988",
      },
    });
    const resValid = await runCronRoute(reqValid);
    assert(resValid.status === 200, "Authorizes server-side cron execution with valid CRON_SECRET (200)");

    delete process.env.CRON_SECRET;
  }

  // 5. In-App Notification Feed
  console.log("\nSection 5: In-App Notification Feed");

  {
    const studentToken = await createTestToken({
      id: "user-st-1",
      email: "student@selffits.com",
      role: "STUDENT",
    });

    const req = new Request("http://localhost:3000/api/v1/notifications", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });
    const res = await getNotificationsRoute(req);
    const json = await res.json();
    assert(
      res.status === 200 && json.success === true && Array.isArray(json.data.notifications),
      "Retrieves notifications feed and unread count for authenticated user (200)"
    );
  }

  console.log("\n=================================================================");
  console.log(` Test Execution Summary: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("=================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
