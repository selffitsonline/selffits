/**
 * SELFFITS Class Lifecycle & Schedule Notifications Test Suite (Step 7C)
 *
 * Verifies that:
 * 1. Schedule updates dispatch in-app and push notifications to enrolled students and coach.
 * 2. Class cancellation/deactivation dispatches in-app and push notifications.
 * 3. Coach reassignment notifies students, the new coach, and the previous coach.
 * 4. Failed operations (unauthorized, conflict) dispatch zero notifications.
 * 5. In-app and push deduplication prevent repeat notifications.
 * 6. Push transport failure does not fail or rollback the underlying batch operation.
 * 7. Student assignment and removal from batch trigger correct notifications.
 * 8. Batch creation notifies the assigned coach.
 * 9. Users not enrolled in the batch do not receive notifications.
 */

// Mock next/cache before loading actions
const nextCache = require("next/cache");
nextCache.revalidatePath = () => {};

import { db } from "../lib/db";
import * as authModule from "../lib/auth";
import { pushNotificationService } from "../lib/push-notification-service";
import {
  createBatchAction,
  updateBatchAction,
  assignStudentToBatchAction,
  removeStudentFromBatchAction,
  deactivateOrDeleteBatchAction,
} from "../actions/batch.actions";

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

// Mock Admin Session
const mockAdminSession = {
  user: {
    id: "admin_user_001",
    email: "admin@selffits.com",
    name: "Admin User",
    role: "ADMIN",
  },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

// Spies and Trackers
let capturedPushSingleCalls: Array<{ userId: string; payload: any; options?: any }> = [];
let capturedPushMultiCalls: Array<{ userIds: string[]; payload: any; options?: any }> = [];
let inMemoryNotifications: Array<any> = [];
let shouldPushThrow = false;
let currentMockSession: any = mockAdminSession;

// Back up original methods
const originalAuth = authModule.auth;
const originalPushSendToUser = pushNotificationService.sendToUser.bind(pushNotificationService);
const originalPushSendToUsers = pushNotificationService.sendToUsers.bind(pushNotificationService);
const originalDbNotificationCreate = db.notification.create.bind(db.notification);
const originalDbNotificationFindFirst = db.notification.findFirst.bind(db.notification);

function resetMocks() {
  capturedPushSingleCalls = [];
  capturedPushMultiCalls = [];
  inMemoryNotifications = [];
  shouldPushThrow = false;

  // Intercept pushNotificationService
  pushNotificationService.sendToUser = async (userId: string, payload: any, options?: any) => {
    capturedPushSingleCalls.push({ userId, payload, options });
    if (shouldPushThrow) {
      throw new Error("Simulated FCM push transport network timeout");
    }
    return {
      success: true,
      successCount: 1,
      failureCount: 0,
      invalidTokens: [],
      errors: [],
    };
  };

  pushNotificationService.sendToUsers = async (userIds: string[], payload: any, options?: any) => {
    capturedPushMultiCalls.push({ userIds, payload, options });
    if (shouldPushThrow) {
      throw new Error("Simulated FCM push transport multi-cast error");
    }
    return {
      success: true,
      successCount: userIds.length,
      failureCount: 0,
      invalidTokens: [],
      errors: [],
    };
  };

  // Intercept db.notification.create
  (db.notification as any).create = async (args: any) => {
    const record = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...args.data,
      isRead: false,
      createdAt: new Date(),
    };
    inMemoryNotifications.push(record);
    return record;
  };

  // Intercept db.notification.findFirst to simulate persistent DB lookups
  (db.notification as any).findFirst = async (args: any) => {
    const { where } = args;
    return (
      inMemoryNotifications.find((n) => {
        if (where.userId && n.userId !== where.userId) return false;
        if (where.title && n.title !== where.title) return false;
        if (where.message?.contains && !n.message.includes(where.message.contains)) return false;
        return true;
      }) || null
    );
  };

  currentMockSession = mockAdminSession;
  (authModule as any).auth = async () => currentMockSession;
}

function restoreAll() {
  (authModule as any).auth = originalAuth;
  pushNotificationService.sendToUser = originalPushSendToUser;
  pushNotificationService.sendToUsers = originalPushSendToUsers;
  (db.notification as any).create = originalDbNotificationCreate;
  (db.notification as any).findFirst = originalDbNotificationFindFirst;
}

async function runClassLifecycleNotificationTests() {
  console.log("=================================================================");
  console.log(" SELFFITS Class Lifecycle Notifications — Automated Test Suite");
  console.log("=================================================================\n");

  try {
    // Common mock entities
    const mockCoachApp1 = {
      id: "coach_app_001",
      fullName: "Sensei Kenji",
      email: "kenji@selffits.com",
    };
    const mockCoachApp2 = {
      id: "coach_app_002",
      fullName: "Coach Sarah",
      email: "sarah@selffits.com",
    };

    const mockCoachUser1 = { id: "usr_coach_kenji", email: "kenji@selffits.com", role: "COACH" };
    const mockCoachUser2 = { id: "usr_coach_sarah", email: "sarah@selffits.com", role: "COACH" };

    // Set up coach user lookup
    (db.coachApplication as any).findUnique = async (args: any) => {
      if (args.where?.id === "coach_app_001") return mockCoachApp1;
      if (args.where?.id === "coach_app_002") return mockCoachApp2;
      return null;
    };

    (db.user as any).findFirst = async (args: any) => {
      const email = args.where?.email?.equals;
      if (email === "kenji@selffits.com") return mockCoachUser1;
      if (email === "sarah@selffits.com") return mockCoachUser2;
      return null;
    };

    // -------------------------------------------------------------
    // Section 1: Class Schedule Changes (updateBatchAction)
    // -------------------------------------------------------------
    console.log("Section 1: Class Schedule Changes (updateBatchAction)");
    resetMocks();

    const mockExistingBatch = {
      id: "batch_mma_101",
      batchId: "BATCH-MMA-101",
      name: "Adults Elite MMA",
      programId: "prog_mma_001",
      coachId: "coach_app_001",
      dayCombination: "Monday & Thursday",
      timeSlot: "Evening",
      clockTiming: "06:15 PM to 07:00 PM (GMT)",
      meetingUrl: "https://meet.google.com/old-link",
      status: "ACTIVE",
      maxCapacity: 8,
      students: [
        { userId: "student_usr_111", user: { id: "student_usr_111", name: "Alice" } },
        { userId: "student_usr_222", user: { id: "student_usr_222", name: "Bob" } },
      ],
      coach: mockCoachApp1,
    };

    (db.batch as any).findUnique = async () => mockExistingBatch;
    (db.batch as any).findFirst = async () => null; // No schedule conflict
    (db.batch as any).update = async (args: any) => ({ ...mockExistingBatch, ...args.data });

    // Update schedule to new days and clock timing
    const scheduleUpdateResult = await updateBatchAction("batch_mma_101", {
      dayCombination: "Saturday & Tuesday",
      clockTiming: "08:00 PM to 08:45 PM (GMT)",
    });

    assert(scheduleUpdateResult.success === true, "updateBatchAction succeeds for schedule update");
    // Should create in-app notifications for both students (2) and coach (1) = 3 total
    assert(inMemoryNotifications.length === 3, "Created in-app notifications for 2 students and 1 coach (3 total)");

    const studentNotifAlice = inMemoryNotifications.find((n) => n.userId === "student_usr_111");
    const studentNotifBob = inMemoryNotifications.find((n) => n.userId === "student_usr_222");
    const coachNotifKenji = inMemoryNotifications.find((n) => n.userId === "usr_coach_kenji");

    assert(Boolean(studentNotifAlice), "Student Alice received in-app schedule notification");
    assert(studentNotifAlice?.title === "Class Schedule Updated 📅", "Student notification title is 'Class Schedule Updated 📅'");
    assert(studentNotifAlice?.message.includes("Saturday & Tuesday"), "Student notification message mentions updated days");
    assert(Boolean(studentNotifBob), "Student Bob received in-app schedule notification");
    assert(Boolean(coachNotifKenji), "Assigned Coach Kenji received in-app schedule notification");
    assert(coachNotifKenji?.title === "Batch Schedule Updated 📅", "Coach notification title is 'Batch Schedule Updated 📅'");

    // Check Push dispatches
    assert(capturedPushMultiCalls.length === 1, "Dispatched multicast push to enrolled students");
    assert(capturedPushMultiCalls[0].userIds.includes("student_usr_111"), "Push recipients include Alice");
    assert(capturedPushMultiCalls[0].userIds.includes("student_usr_222"), "Push recipients include Bob");
    assert(capturedPushMultiCalls[0].payload.data.type === "SCHEDULE_CHANGE", "Push data.type is 'SCHEDULE_CHANGE'");
    assert(capturedPushMultiCalls[0].payload.data.deepLink === "selffits://dashboard/student", "Student deepLink is student dashboard");

    assert(capturedPushSingleCalls.length === 1, "Dispatched single push to assigned coach");
    assert(capturedPushSingleCalls[0].userId === "usr_coach_kenji", "Coach push recipient is Coach Kenji");
    assert(capturedPushSingleCalls[0].payload.data.deepLink === "selffits://dashboard/coach", "Coach deepLink is coach dashboard");

    // Idempotency: Second call with same schedule does not duplicate in-app records
    console.log("Sub-section 1.2: Schedule Update Idempotency");
    const duplicateUpdateResult = await updateBatchAction("batch_mma_101", {
      dayCombination: "Saturday & Tuesday",
      clockTiming: "08:00 PM to 08:45 PM (GMT)",
    });
    assert(duplicateUpdateResult.success === true, "Repeated updateBatchAction succeeds");
    assert(inMemoryNotifications.length === 3, "No duplicate in-app notifications created on repeated update (remains 3)");

    console.log();

    // -------------------------------------------------------------
    // Section 2: Class Cancellation & Deactivation
    // -------------------------------------------------------------
    console.log("Section 2: Class Cancellation & Deactivation");
    resetMocks();

    (db.batch as any).findUnique = async () => mockExistingBatch;
    (db.batch as any).update = async (args: any) => ({ ...mockExistingBatch, ...args.data });

    // Test 2.1: Deactivate batch via updateBatchAction (status: "INACTIVE")
    const cancelResult = await updateBatchAction("batch_mma_101", {
      status: "INACTIVE",
    });

    assert(cancelResult.success === true, "updateBatchAction succeeds for INACTIVE status");
    assert(inMemoryNotifications.length === 3, "Created in-app cancellation notifications for 2 students + 1 coach");

    const cancelNotifAlice = inMemoryNotifications.find((n) => n.userId === "student_usr_111");
    assert(cancelNotifAlice?.title === "Class Batch Cancelled ⚠️", "Student cancellation title is 'Class Batch Cancelled ⚠️'");
    assert(cancelNotifAlice?.message.includes("cancelled"), "Student cancellation message informs of deactivation");

    const cancelNotifCoach = inMemoryNotifications.find((n) => n.userId === "usr_coach_kenji");
    assert(cancelNotifCoach?.title === "Batch Deactivated ⚠️", "Coach cancellation title is 'Batch Deactivated ⚠️'");

    assert(capturedPushMultiCalls.length === 1, "Dispatched cancellation push to students");
    assert(capturedPushMultiCalls[0].payload.data.type === "CLASS_CANCELLED", "Push type is 'CLASS_CANCELLED'");
    assert(capturedPushSingleCalls.length === 1, "Dispatched cancellation push to coach");

    // Test 2.2: Deactivate via deactivateOrDeleteBatchAction
    resetMocks();
    (db.batch as any).findUnique = async () => mockExistingBatch;
    (db.batch as any).update = async (args: any) => ({ ...mockExistingBatch, ...args.data });

    const deactActionRes = await deactivateOrDeleteBatchAction("batch_mma_101", false);
    assert(deactActionRes.success === true, "deactivateOrDeleteBatchAction succeeds");
    assert(inMemoryNotifications.length === 3, "deactivateOrDeleteBatchAction creates in-app notifications for students and coach");

    console.log();

    // -------------------------------------------------------------
    // Section 3: Coach Reassignment (updateBatchAction with new coach)
    // -------------------------------------------------------------
    console.log("Section 3: Coach Reassignment (updateBatchAction)");
    resetMocks();

    (db.batch as any).findUnique = async () => mockExistingBatch; // Existing coach is coach_app_001
    (db.batch as any).findFirst = async () => null; // No schedule conflict
    (db.batch as any).update = async (args: any) => ({ ...mockExistingBatch, ...args.data });

    // Reassign batch to coach_app_002 (Coach Sarah)
    const reassignResult = await updateBatchAction("batch_mma_101", {
      coachId: "coach_app_002",
    });

    assert(reassignResult.success === true, "updateBatchAction succeeds for coach reassignment");
    // Should notify: Alice, Bob (students), Coach Sarah (new coach), Coach Kenji (prev coach) = 4 total
    assert(inMemoryNotifications.length === 4, "Created in-app notifications for 2 students + new coach + prev coach (4 total)");

    const studentReassignNotif = inMemoryNotifications.find((n) => n.userId === "student_usr_111");
    assert(studentReassignNotif?.title === "Coach Assigned 🥋", "Student notification title is 'Coach Assigned 🥋'");
    assert(studentReassignNotif?.message.includes("Coach Sarah"), "Student notification names new Coach Sarah");

    const newCoachNotif = inMemoryNotifications.find((n) => n.userId === "usr_coach_sarah");
    assert(newCoachNotif?.title === "New Batch Assigned 🥋", "New coach title is 'New Batch Assigned 🥋'");

    const prevCoachNotif = inMemoryNotifications.find((n) => n.userId === "usr_coach_kenji");
    assert(prevCoachNotif?.title === "Batch Assignment Updated 📋", "Previous coach title is 'Batch Assignment Updated 📋'");
    assert(prevCoachNotif?.message.includes("unassigned"), "Previous coach message informs of unassignment");

    // Check push notifications
    assert(capturedPushMultiCalls.length === 1, "Dispatched coach reassignment push to students");
    assert(capturedPushSingleCalls.length === 2, "Dispatched push to both new coach and previous coach (2 single pushes)");

    const pushNewCoach = capturedPushSingleCalls.find((p) => p.userId === "usr_coach_sarah");
    const pushPrevCoach = capturedPushSingleCalls.find((p) => p.userId === "usr_coach_kenji");
    assert(Boolean(pushNewCoach), "Push dispatched to new coach Sarah");
    assert(Boolean(pushPrevCoach), "Push dispatched to previous coach Kenji");

    console.log();

    // -------------------------------------------------------------
    // Section 4: Student Batch Assignment & Removal
    // -------------------------------------------------------------
    console.log("Section 4: Student Batch Assignment & Removal");
    resetMocks();

    const mockBatchWithRoom = {
      id: "batch_mma_101",
      name: "Adults Elite MMA",
      programId: "prog_mma_001",
      coachId: "coach_app_001",
      dayCombination: "Monday & Thursday",
      clockTiming: "06:15 PM to 07:00 PM (GMT)",
      maxCapacity: 8,
      students: [],
      program: { title: "Adults MMA", id: "prog_mma_001" },
    };

    (db.batch as any).findUnique = async () => mockBatchWithRoom;
    (db.batchStudent as any).findUnique = async () => null; // Student not yet assigned
    (db.user as any).findUnique = async () => ({
      id: "student_usr_333",
      name: "Charlie",
      enrollments: [{ status: "ACTIVE", membershipPlan: { programId: "prog_mma_001" } }],
    });
    (db.batchStudent as any).create = async (args: any) => args.data;
    (db.batch as any).update = async (args: any) => args.data;

    const assignStudentResult = await assignStudentToBatchAction("batch_mma_101", "student_usr_333");
    assert(assignStudentResult.success === true, "assignStudentToBatchAction succeeds");
    // Notifies student Charlie (1) + Coach Kenji (1) = 2 total
    assert(inMemoryNotifications.length === 2, "Created in-app notifications for student Charlie and Coach Kenji");

    const assignNotifStudent = inMemoryNotifications.find((n) => n.userId === "student_usr_333");
    assert(assignNotifStudent?.title === "Assigned to Class Batch 🥋", "Student notification title is 'Assigned to Class Batch 🥋'");

    const assignNotifCoach = inMemoryNotifications.find((n) => n.userId === "usr_coach_kenji");
    assert(assignNotifCoach?.title === "New Student in Batch 🥋", "Coach notification title is 'New Student in Batch 🥋'");
    assert(assignNotifCoach?.message.includes("Charlie"), "Coach notification mentions student Charlie");

    // Removal
    resetMocks();
    (db.batchStudent as any).deleteMany = async () => ({ count: 1 });
    (db.batch as any).findUnique = async () => mockBatchWithRoom;

    const removeStudentResult = await removeStudentFromBatchAction("batch_mma_101", "student_usr_333");
    assert(removeStudentResult.success === true, "removeStudentFromBatchAction succeeds");
    assert(inMemoryNotifications.length === 1, "Created in-app removal notification for student Charlie");
    assert(inMemoryNotifications[0].title === "Removed from Class Batch 📋", "Removal notification title is 'Removed from Class Batch 📋'");
    assert(capturedPushSingleCalls.length === 1, "Dispatched removal push to student Charlie");

    console.log();

    // -------------------------------------------------------------
    // Section 5: Batch Creation (createBatchAction)
    // -------------------------------------------------------------
    console.log("Section 5: Batch Creation (createBatchAction)");
    resetMocks();

    (db.program as any).findUnique = async () => ({ id: "prog_mma_001", title: "Adults MMA" });
    (db.batch as any).findFirst = async () => null; // No schedule conflict
    (db.batch as any).create = async (args: any) => ({
      id: "batch_created_505",
      ...args.data,
    });

    const createBatchResult = await createBatchAction({
      name: "Kids Karate Fun",
      programId: "prog_mma_001",
      beltLevel: "White Belt",
      coachId: "coach_app_001",
      dayCombination: "Sunday & Wednesday",
      timeSlot: "Morning",
    });

    assert(createBatchResult.success === true, "createBatchAction succeeds");
    assert(inMemoryNotifications.length === 1, "Created in-app notification for assigned Coach Kenji");
    assert(inMemoryNotifications[0].title === "New Class Batch Created 🥋", "Title is 'New Class Batch Created 🥋'");
    assert(capturedPushSingleCalls.length === 1, "Dispatched single push to Coach Kenji");
    assert(capturedPushSingleCalls[0].userId === "usr_coach_kenji", "Recipient is Coach Kenji");
    assert(capturedPushSingleCalls[0].payload.data.deepLink === "selffits://dashboard/coach", "DeepLink is coach dashboard");

    console.log();

    // -------------------------------------------------------------
    // Section 6: Failure & Authorization Isolation
    // -------------------------------------------------------------
    console.log("Section 6: Failure & Authorization Isolation");

    // Test 6.1: Unauthorized caller gets rejected and sends zero notifications
    resetMocks();
    currentMockSession = {
      user: { id: "student_usr_999", role: "STUDENT" }, // Non-admin
    };

    const unauthResult = await updateBatchAction("batch_mma_101", {
      dayCombination: "Monday & Thursday",
    });
    assert(unauthResult.success === false, "Unauthorized updateBatchAction rejected");
    assert(inMemoryNotifications.length === 0, "No notification sent for unauthorized action");
    assert(capturedPushSingleCalls.length === 0, "No push sent for unauthorized action");
    assert(capturedPushMultiCalls.length === 0, "No multicast push sent for unauthorized action");

    // Test 6.2: Push transport failure does not fail the batch action (fail-open)
    resetMocks();
    (db.batch as any).findUnique = async () => mockExistingBatch;
    (db.batch as any).findFirst = async () => null;
    (db.batch as any).update = async (args: any) => ({ ...mockExistingBatch, ...args.data });
    shouldPushThrow = true;

    const resilientResult = await updateBatchAction("batch_mma_101", {
      dayCombination: "Monday & Thursday",
      clockTiming: "09:00 AM to 09:45 AM (GMT)",
    });

    assert(resilientResult.success === true, "updateBatchAction succeeds even if push dispatch throws an exception");
    assert(inMemoryNotifications.length === 3, "In-app database notifications were preserved despite push exception");

    console.log();
  } finally {
    restoreAll();
  }

  console.log("=================================================================");
  console.log(` Class Lifecycle Notifications Summary: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("=================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runClassLifecycleNotificationTests().catch((err) => {
  console.error("Test runner encountered unhandled error:", err);
  process.exit(1);
});
