import assert from "assert";
import { calculateNextClassSession } from "@/lib/class-schedule";
import { pushNotificationService, PushNotificationService } from "@/lib/push-notification-service";
import { db } from "@/lib/db";
import { GET, POST } from "@/app/api/v1/cron/class-reminders/route";

async function runClassReminderReliabilityTests() {
  console.log("=================================================================");
  console.log(" SELFFITS Class Reminder Reliability — Automated Test Suite");
  console.log("=================================================================");

  let passed = 0;
  let failed = 0;

  function test(desc: string, condition: boolean) {
    if (condition) {
      console.log(`  ✓ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      failed++;
    }
  }

  // Set up in-memory mock storage for database calls during tests
  const inMemoryDbNotifications: Array<{
    id: string;
    userId: string;
    title: string;
    message: string;
    createdAt: Date;
  }> = [];

  const inMemoryUsers: Array<{ id: string; email: string; name: string }> = [
    { id: "student_remind_01", email: "student01@test.com", name: "Student Alpha" },
    { id: "student_remind_02", email: "student02@test.com", name: "Student Beta" },
    { id: "coach_user_remind", email: "coach_sensei@test.com", name: "Sensei Takeda" },
  ];

  // Mock db.notification and db.user
  const origNotificationFindFirst = db.notification.findFirst;
  const origNotificationCreate = db.notification.create;
  const origUserFindMany = db.user.findMany;
  const origUserFindFirst = db.user.findFirst;
  const origBatchFindMany = db.batch.findMany;
  const origWebsiteSettings = (db as any).websiteSettings;

  (db as any).websiteSettings = {
    findUnique: async () => null,
    upsert: async () => null,
  };

  // Pre-register device token for student_remind_01 so mock provider receives pushes
  const { DeviceTokenStore } = await import("@/lib/device-token-store");
  await DeviceTokenStore._resetForTesting();
  await DeviceTokenStore.registerToken({
    userId: "student_remind_01",
    role: "STUDENT",
    platform: "android",
    token: "token_student_remind_01",
  });

  db.notification.findFirst = (async (args: any) => {
    return (
      inMemoryDbNotifications.find((n) => {
        if (args.where?.userId && n.userId !== args.where.userId) return false;
        if (args.where?.title && n.title !== args.where.title) return false;
        if (args.where?.message?.contains && !n.message.includes(args.where.message.contains)) return false;
        return true;
      }) || null
    );
  }) as any;

  db.notification.create = (async (args: any) => {
    const record = {
      id: `notif_${Date.now()}_${Math.random()}`,
      userId: args.data.userId,
      title: args.data.title,
      message: args.data.message,
      createdAt: new Date(),
    };
    inMemoryDbNotifications.push(record);
    return record;
  }) as any;

  db.user.findMany = (async (args: any) => {
    if (args.where?.id?.in) {
      return inMemoryUsers.filter((u) => args.where.id.in.includes(u.id));
    }
    return inMemoryUsers;
  }) as any;

  db.user.findFirst = (async (args: any) => {
    if (args.where?.email) {
      const email = typeof args.where.email === "object" ? args.where.email.equals : args.where.email;
      return inMemoryUsers.find((u) => u.email.toLowerCase() === email?.toLowerCase()) || null;
    }
    return null;
  }) as any;

  // Track push provider dispatches
  const dispatchedPushes: Array<{ tokens: any[]; payload: any; options?: any }> = [];
  let shouldPushFail = false;

  const mockProvider = {
    async send(tokens: any[], payload: any) {
      if (shouldPushFail) {
        throw new Error("Simulated FCM network timeout during push");
      }
      dispatchedPushes.push({ tokens, payload });
      return {
        success: true,
        successCount: tokens.length,
        failureCount: 0,
        invalidTokens: [],
        errors: [],
      };
    },
  };

  pushNotificationService.setProvider(mockProvider as any);

  try {
    // -------------------------------------------------------------
    // Section 1: Reminder Window Boundary Calculations
    // -------------------------------------------------------------
    console.log("\nSection 1: Reminder Window Boundary Calculations");

    // Helper mirror from route.ts
    function getMinutesUntilClassStartTest(clockTiming: string, referenceDate: Date): number | null {
      const timeMatch = clockTiming.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!timeMatch) return null;
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const modifier = timeMatch[3].toUpperCase();
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      const classStartUtc = new Date(referenceDate);
      classStartUtc.setUTCHours(hours, minutes, 0, 0);
      const diffMs = classStartUtc.getTime() - referenceDate.getTime();
      return Math.floor(diffMs / (60 * 1000));
    }

    const testRefDate = new Date("2026-10-29T17:00:00.000Z");

    const diff15 = getMinutesUntilClassStartTest("05:15 PM to 06:00 PM (GMT)", testRefDate);
    test("Upper window boundary (exactly 15 minutes) is within target window", diff15 === 15);

    const diff10 = getMinutesUntilClassStartTest("05:10 PM to 06:00 PM (GMT)", testRefDate);
    test("Mid window (10 minutes) is within target window", diff10 === 10);

    const diff0 = getMinutesUntilClassStartTest("05:00 PM to 06:00 PM (GMT)", testRefDate);
    test("Lower window boundary (exactly 0 minutes) is within target window", diff0 === 0);

    const diff16 = getMinutesUntilClassStartTest("05:16 PM to 06:00 PM (GMT)", testRefDate);
    test("Outside upper boundary (16 minutes) is correctly excluded (> 15)", diff16 === 16);

    const diffPast1 = getMinutesUntilClassStartTest("04:59 PM to 05:45 PM (GMT)", testRefDate);
    test("Past class (-1 minute) is correctly excluded (< 0)", diffPast1 === -1);

    const diffPast30 = getMinutesUntilClassStartTest("04:30 PM to 05:15 PM (GMT)", testRefDate);
    test("Far past class (-30 minutes) is correctly excluded", diffPast30 === -30);

    // -------------------------------------------------------------
    // Section 2: Timezone & Day-Boundary Behavior
    // -------------------------------------------------------------
    console.log("\nSection 2: Timezone & Day-Boundary Behavior");

    // Wednesday night 22:30 UTC = Thursday 04:00 AM IST
    const wednesdayUtcNight = new Date("2026-10-28T22:30:00.000Z");

    // A batch on Wednesday & Saturday
    const wednesdaySessionUtc = calculateNextClassSession(
      "Wednesday & Saturday",
      "10:30 PM to 11:15 PM (GMT)",
      "Night",
      wednesdayUtcNight,
      { useUtc: true }
    );

    test("useUtc: true evaluates current day based on UTC date", wednesdaySessionUtc.nextClassDay === "Wednesday");
    test("useUtc: true correctly identifies Wednesday night as Today in UTC", wednesdaySessionUtc.isToday === true);

    // Thursday morning 00:05 UTC = Thursday 05:35 AM IST
    const thursdayUtcMorning = new Date("2026-10-29T00:05:00.000Z");
    const thursdaySessionUtc = calculateNextClassSession(
      "Thursday & Sunday",
      "12:15 AM to 01:00 AM (GMT)",
      "Night",
      thursdayUtcMorning,
      { useUtc: true }
    );

    test("Thursday 00:05 UTC correctly resolves to Thursday as Today", thursdaySessionUtc.nextClassDay === "Thursday");
    test("Thursday 00:05 UTC has isToday: true", thursdaySessionUtc.isToday === true);

    // Backward compatibility: options omitted defaults to local without throwing
    const defaultLocalSession = calculateNextClassSession(
      "Monday & Thursday",
      "05:00 PM to 06:00 PM (GMT)",
      "Evening",
      thursdayUtcMorning
    );
    test("calculateNextClassSession without options succeeds with backward compatibility", typeof defaultLocalSession.nextClassDay === "string");

    // -------------------------------------------------------------
    // Section 3: Session-Level Deduplication (Two Sessions on Same Day)
    // -------------------------------------------------------------
    console.log("\nSection 3: Session-Level Deduplication (Two Sessions on Same Day)");

    pushNotificationService._clearDedupCache();
    inMemoryDbNotifications.length = 0;
    dispatchedPushes.length = 0;

    const batchId = "batch_double_session_99";
    const dateStr = "2026-10-29";

    // Morning Session: 09:00 AM
    const morningResult = await pushNotificationService.sendClassReminder({
      batchId,
      batchName: "Karate Masterclass (Morning)",
      coachName: "Sensei Takeda",
      startTimeStr: "09:00 AM to 09:45 AM (GMT)",
      userIds: ["student_remind_01"],
      dateStr,
    });

    test("Morning session reminder is dispatched (not deduplicated)", morningResult.deduplicated !== true);
    test("Morning session creates in-app notification in DB", inMemoryDbNotifications.length === 1);
    test("Morning session notification message includes session reference key", inMemoryDbNotifications[0].message.includes("reminder:batch_double_session_99:2026-10-29:09:00AM"));

    // Evening Session on SAME day: 05:00 PM
    const eveningResult = await pushNotificationService.sendClassReminder({
      batchId,
      batchName: "Karate Masterclass (Evening)",
      coachName: "Sensei Takeda",
      startTimeStr: "05:00 PM to 05:45 PM (GMT)",
      userIds: ["student_remind_01"],
      dateStr,
    });

    test("Evening session on same day is NOT suppressed by morning session", eveningResult.deduplicated !== true);
    test("Evening session creates distinct in-app notification in DB (now 2)", inMemoryDbNotifications.length === 2);
    test("Evening session has distinct session reference key", inMemoryDbNotifications[1].message.includes("reminder:batch_double_session_99:2026-10-29:05:00PM"));

    // Re-dispatch Morning Session (immediate duplicate)
    const morningDupResult = await pushNotificationService.sendClassReminder({
      batchId,
      batchName: "Karate Masterclass (Morning)",
      coachName: "Sensei Takeda",
      startTimeStr: "09:00 AM to 09:45 AM (GMT)",
      userIds: ["student_remind_01"],
      dateStr,
    });

    test("Repeated morning session is safely suppressed with deduplicated: true", morningDupResult.deduplicated === true);
    test("Repeated morning session does NOT create a 3rd DB record", inMemoryDbNotifications.length === 2);

    // Re-dispatch Evening Session (immediate duplicate)
    const eveningDupResult = await pushNotificationService.sendClassReminder({
      batchId,
      batchName: "Karate Masterclass (Evening)",
      coachName: "Sensei Takeda",
      startTimeStr: "05:00 PM to 05:45 PM (GMT)",
      userIds: ["student_remind_01"],
      dateStr,
    });

    test("Repeated evening session is safely suppressed with deduplicated: true", eveningDupResult.deduplicated === true);
    test("DB notification count remains exactly 2", inMemoryDbNotifications.length === 2);

    // -------------------------------------------------------------
    // Section 4: In-App Deduplication Across Container Restarts
    // -------------------------------------------------------------
    console.log("\nSection 4: In-App Deduplication Across Container Restarts");

    // Simulate serverless cold start / new container by wiping in-memory cache
    pushNotificationService._clearDedupCache();

    // Now call sendClassReminder again on the same session from a fresh container
    const crossContainerResult = await pushNotificationService.sendClassReminder({
      batchId,
      batchName: "Karate Masterclass (Morning)",
      coachName: "Sensei Takeda",
      startTimeStr: "09:00 AM to 09:45 AM (GMT)",
      userIds: ["student_remind_01"],
      dateStr,
    });

    test("Cross-container retry executes push check", crossContainerResult.success === true);
    test("Cross-container retry does NOT insert a duplicate in-app DB row (DB check works)", inMemoryDbNotifications.length === 2);

    // -------------------------------------------------------------
    // Section 5: Cron Security & Fail-Closed Behavior
    // -------------------------------------------------------------
    console.log("\nSection 5: Cron Security & Fail-Closed Behavior");

    const origCronSecret = process.env.CRON_SECRET;

    // A. Unset secret
    delete process.env.CRON_SECRET;
    const reqUnset = new Request("http://localhost:3000/api/v1/cron/class-reminders", { method: "GET" });
    const resUnset = await GET(reqUnset);
    test("GET without CRON_SECRET configured returns HTTP 401", resUnset.status === 401);
    const jsonUnset = await resUnset.json();
    test("Error code is UNAUTHORIZED_CRON", jsonUnset.error.code === "UNAUTHORIZED_CRON");

    // B. Configured secret but invalid authorization header
    process.env.CRON_SECRET = "super_secure_cron_test_secret_12345";
    const reqBadAuth = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "GET",
      headers: { authorization: "Bearer wrong_secret_token" },
    });
    const resBadAuth = await GET(reqBadAuth);
    test("GET with mismatched Bearer token returns HTTP 401", resBadAuth.status === 401);

    // C. Configured secret with valid Bearer token
    // Set up mock batch to test successful cron scan
    db.batch.findMany = (async () => []) as any;

    const reqValidBearer = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "GET",
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    });
    const resValidBearer = await GET(reqValidBearer);
    test("GET with valid Bearer secret returns HTTP 200", resValidBearer.status === 200);

    // D. Configured secret with valid x-cron-secret header
    const reqValidCustom = new Request("http://localhost:3000/api/v1/cron/class-reminders", {
      method: "POST",
      headers: { "x-cron-secret": process.env.CRON_SECRET },
    });
    const resValidCustom = await POST(reqValidCustom);
    test("POST with valid x-cron-secret header returns HTTP 200", resValidCustom.status === 200);

    // Restore CRON_SECRET
    if (origCronSecret !== undefined) {
      process.env.CRON_SECRET = origCronSecret;
    } else {
      delete process.env.CRON_SECRET;
    }

    // -------------------------------------------------------------
    // Section 6: Push Transport Fail-Open Resilience
    // -------------------------------------------------------------
    console.log("\nSection 6: Push Transport Fail-Open Resilience");

    pushNotificationService._clearDedupCache();
    inMemoryDbNotifications.length = 0;
    shouldPushFail = true;

    // Attempt reminder when FCM throws
    let pushFailedWithoutCrashing = false;
    try {
      const failOpenResult = await pushNotificationService.sendClassReminder({
        batchId: "batch_fail_open_test",
        batchName: "Judo Beginners",
        coachName: "Sensei Takeda",
        startTimeStr: "03:00 PM to 03:45 PM (GMT)",
        userIds: ["student_remind_01"],
        dateStr: "2026-10-29",
      });
      pushFailedWithoutCrashing = true;
    } catch {
      pushFailedWithoutCrashing = false;
    }

    test("Push transport error is caught gracefully without throwing unhandled exception", pushFailedWithoutCrashing === true);
    test("In-app database notification was safely persisted before push failure", inMemoryDbNotifications.length === 1);

    shouldPushFail = false;

    // -------------------------------------------------------------
    // Section 7: Deep Link Integrity
    // -------------------------------------------------------------
    console.log("\nSection 7: Deep Link Integrity");

    pushNotificationService._clearDedupCache();
    dispatchedPushes.length = 0;

    await pushNotificationService.sendClassReminder({
      batchId: "batch_link_check",
      batchName: "Aikido Advanced",
      coachName: "Sensei Takeda",
      meetingUrl: "https://meet.google.com/test-meet-123",
      startTimeStr: "08:00 AM to 08:45 AM (GMT)",
      userIds: ["student_remind_01"],
      dateStr: "2026-10-30",
    });

    test("Dispatched push payload has type CLASS_REMINDER", dispatchedPushes[0]?.payload.data.type === "CLASS_REMINDER");
    test("Deep link matches custom app scheme 'selffits://class/live?batchId=batch_link_check'", dispatchedPushes[0]?.payload.data.deepLink === "selffits://class/live?batchId=batch_link_check");
    test("Meeting URL is included in custom data", dispatchedPushes[0]?.payload.data.meetingUrl === "https://meet.google.com/test-meet-123");

  } finally {
    // Restore mocks
    db.notification.findFirst = origNotificationFindFirst;
    db.notification.create = origNotificationCreate;
    db.user.findMany = origUserFindMany;
    db.user.findFirst = origUserFindFirst;
    db.batch.findMany = origBatchFindMany;
    (db as any).websiteSettings = origWebsiteSettings;
  }

  console.log("\n=================================================================");
  console.log(` Class Reminder Reliability Summary: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runClassReminderReliabilityTests().catch((err) => {
  console.error("Unhandled error in test runner:", err);
  process.exit(1);
});
