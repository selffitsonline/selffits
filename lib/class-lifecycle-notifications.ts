import { db } from "@/lib/db";
import { pushNotificationService } from "@/lib/push-notification-service";

/**
 * Resolves the coach's authentic User ID from a CoachApplication ID.
 * Returns null safely if the coach application has not yet been provisioned with a User account.
 */
export async function resolveCoachUserId(coachApplicationId: string, fallbackEmail?: string): Promise<string | null> {
  try {
    let email = fallbackEmail;
    if (!email) {
      const coachApp = await db.coachApplication.findUnique({
        where: { id: coachApplicationId },
        select: { email: true },
      });
      email = coachApp?.email;
    }

    if (!email) return null;

    const coachUser = await db.user.findFirst({
      where: {
        email: { equals: email.trim(), mode: "insensitive" },
        role: "COACH",
      },
      select: { id: true },
    });

    return coachUser?.id || null;
  } catch (err) {
    console.warn(`Failed to resolve coach user account for coachApplicationId ${coachApplicationId}:`, err);
    return null;
  }
}

/**
 * Creates an in-app database notification with database-level idempotency checking.
 */
async function createInAppNotificationIdempotent(
  userId: string,
  title: string,
  message: string,
  refKey: string
): Promise<boolean> {
  try {
    const existing = await db.notification.findFirst({
      where: {
        userId,
        title,
        message: { contains: `(Ref: ${refKey})` },
      },
    });

    if (existing) {
      return false; // Already created, skip duplicate
    }

    await db.notification.create({
      data: {
        userId,
        title,
        message: `${message} (Ref: ${refKey})`,
      },
    });

    return true;
  } catch (err) {
    console.warn(`Failed to create in-app notification for user ${userId}:`, err);
    return false;
  }
}

// =========================================================================
// 1. CLASS SCHEDULE CHANGE NOTIFICATION
// =========================================================================

export interface BatchScheduleChangeParams {
  batchId: string;
  batchName: string;
  dayCombination: string;
  clockTiming: string;
  meetingUrl?: string | null;
  studentUserIds: string[];
  coachApplicationId?: string;
}

export async function notifyBatchScheduleChange(params: BatchScheduleChangeParams): Promise<{
  studentsNotified: number;
  coachNotified: boolean;
}> {
  const { batchId, batchName, dayCombination, clockTiming, studentUserIds, coachApplicationId } = params;
  const refKey = `sched:${batchId}:${dayCombination}:${clockTiming}`;

  let studentsNotified = 0;
  let coachNotified = false;

  // 1. Notify Enrolled Students
  const studentTitle = "Class Schedule Updated 📅";
  const studentBody = `The schedule for batch "${batchName}" has been updated to ${dayCombination} (${clockTiming}).`;

  for (const studentId of studentUserIds) {
    const created = await createInAppNotificationIdempotent(studentId, studentTitle, studentBody, refKey);
    if (created) studentsNotified++;
  }

  if (studentUserIds.length > 0) {
    try {
      await pushNotificationService.sendToUsers(
        studentUserIds,
        {
          title: studentTitle,
          body: studentBody,
          data: {
            type: "SCHEDULE_CHANGE",
            deepLink: "selffits://dashboard/student",
            batchId,
            dayCombination,
            clockTiming,
          },
        },
        {
          persistInApp: false,
          deduplicationKey: `push:sched:${batchId}:${dayCombination}:${clockTiming}`,
        }
      );
    } catch (pushErr) {
      console.warn(`Failed to dispatch schedule change push to students for batch ${batchId}:`, pushErr);
    }
  }

  // 2. Notify Assigned Coach
  if (coachApplicationId) {
    const coachUserId = await resolveCoachUserId(coachApplicationId);
    if (coachUserId) {
      const coachTitle = "Batch Schedule Updated 📅";
      const coachBody = `Schedule for your batch "${batchName}" has been updated to ${dayCombination} (${clockTiming}).`;

      const created = await createInAppNotificationIdempotent(coachUserId, coachTitle, coachBody, refKey);
      if (created) coachNotified = true;

      try {
        await pushNotificationService.sendToUser(
          coachUserId,
          {
            title: coachTitle,
            body: coachBody,
            data: {
              type: "SCHEDULE_CHANGE",
              deepLink: "selffits://dashboard/coach",
              batchId,
              dayCombination,
              clockTiming,
            },
          },
          {
            persistInApp: false,
            deduplicationKey: `push:sched_coach:${batchId}:${dayCombination}:${clockTiming}`,
          }
        );
      } catch (pushErr) {
        console.warn(`Failed to dispatch schedule change push to coach for batch ${batchId}:`, pushErr);
      }
    }
  }

  return { studentsNotified, coachNotified };
}

// =========================================================================
// 2. CLASS CANCELLATION / DEACTIVATION NOTIFICATION
// =========================================================================

export interface BatchCancellationParams {
  batchId: string;
  batchName: string;
  studentUserIds: string[];
  coachApplicationId?: string;
}

export async function notifyBatchCancellation(params: BatchCancellationParams): Promise<{
  studentsNotified: number;
  coachNotified: boolean;
}> {
  const { batchId, batchName, studentUserIds, coachApplicationId } = params;
  const refKey = `cancel:${batchId}`;

  let studentsNotified = 0;
  let coachNotified = false;

  const studentTitle = "Class Batch Cancelled ⚠️";
  const studentBody = `Batch "${batchName}" has been deactivated or cancelled. Please visit your dashboard to select an alternative batch.`;

  for (const studentId of studentUserIds) {
    const created = await createInAppNotificationIdempotent(studentId, studentTitle, studentBody, refKey);
    if (created) studentsNotified++;
  }

  if (studentUserIds.length > 0) {
    try {
      await pushNotificationService.sendToUsers(
        studentUserIds,
        {
          title: studentTitle,
          body: studentBody,
          data: {
            type: "CLASS_CANCELLED",
            deepLink: "selffits://dashboard/student",
            batchId,
          },
        },
        {
          persistInApp: false,
          deduplicationKey: `push:cancel:${batchId}`,
        }
      );
    } catch (pushErr) {
      console.warn(`Failed to dispatch class cancellation push to students for batch ${batchId}:`, pushErr);
    }
  }

  // Notify Coach
  if (coachApplicationId) {
    const coachUserId = await resolveCoachUserId(coachApplicationId);
    if (coachUserId) {
      const coachTitle = "Batch Deactivated ⚠️";
      const coachBody = `Your batch "${batchName}" has been deactivated or cancelled.`;

      const created = await createInAppNotificationIdempotent(coachUserId, coachTitle, coachBody, refKey);
      if (created) coachNotified = true;

      try {
        await pushNotificationService.sendToUser(
          coachUserId,
          {
            title: coachTitle,
            body: coachBody,
            data: {
              type: "CLASS_CANCELLED",
              deepLink: "selffits://dashboard/coach",
              batchId,
            },
          },
          {
            persistInApp: false,
            deduplicationKey: `push:cancel_coach:${batchId}`,
          }
        );
      } catch (pushErr) {
        console.warn(`Failed to dispatch class cancellation push to coach for batch ${batchId}:`, pushErr);
      }
    }
  }

  return { studentsNotified, coachNotified };
}

// =========================================================================
// 3. COACH REASSIGNMENT NOTIFICATION
// =========================================================================

export interface CoachReassignmentParams {
  batchId: string;
  batchName: string;
  dayCombination: string;
  clockTiming: string;
  studentUserIds: string[];
  newCoachApplicationId: string;
  newCoachName?: string;
  previousCoachApplicationId?: string;
}

export async function notifyCoachReassignment(params: CoachReassignmentParams): Promise<{
  studentsNotified: number;
  newCoachNotified: boolean;
  previousCoachNotified: boolean;
}> {
  const {
    batchId,
    batchName,
    dayCombination,
    clockTiming,
    studentUserIds,
    newCoachApplicationId,
    newCoachName = "your head coach",
    previousCoachApplicationId,
  } = params;

  const refKey = `coach_reassign:${batchId}:${newCoachApplicationId}`;
  let studentsNotified = 0;
  let newCoachNotified = false;
  let previousCoachNotified = false;

  // 1. Notify Students
  const studentTitle = "Coach Assigned 🥋";
  const studentBody = `Coach ${newCoachName} is now the assigned coach for your batch "${batchName}".`;

  for (const studentId of studentUserIds) {
    const created = await createInAppNotificationIdempotent(studentId, studentTitle, studentBody, refKey);
    if (created) studentsNotified++;
  }

  if (studentUserIds.length > 0) {
    try {
      await pushNotificationService.sendToUsers(
        studentUserIds,
        {
          title: studentTitle,
          body: studentBody,
          data: {
            type: "SCHEDULE_CHANGE",
            deepLink: "selffits://dashboard/student",
            batchId,
          },
        },
        {
          persistInApp: false,
          deduplicationKey: `push:coach_reassign_students:${batchId}:${newCoachApplicationId}`,
        }
      );
    } catch (pushErr) {
      console.warn(`Failed to dispatch coach reassignment push to students for batch ${batchId}:`, pushErr);
    }
  }

  // 2. Notify New Coach
  const newCoachUserId = await resolveCoachUserId(newCoachApplicationId);
  if (newCoachUserId) {
    const coachTitle = "New Batch Assigned 🥋";
    const coachBody = `You have been assigned as the head coach for batch "${batchName}" (${dayCombination} at ${clockTiming}).`;

    const created = await createInAppNotificationIdempotent(newCoachUserId, coachTitle, coachBody, refKey);
    if (created) newCoachNotified = true;

    try {
      await pushNotificationService.sendToUser(
        newCoachUserId,
        {
          title: coachTitle,
          body: coachBody,
          data: {
            type: "SCHEDULE_CHANGE",
            deepLink: "selffits://dashboard/coach",
            batchId,
            dayCombination,
            clockTiming,
          },
        },
        {
          persistInApp: false,
          deduplicationKey: `push:new_coach_assign:${batchId}:${newCoachApplicationId}`,
        }
      );
    } catch (pushErr) {
      console.warn(`Failed to dispatch new batch push to coach for batch ${batchId}:`, pushErr);
    }
  }

  // 3. Notify Previous Coach (if different)
  if (previousCoachApplicationId && previousCoachApplicationId !== newCoachApplicationId) {
    const prevCoachUserId = await resolveCoachUserId(previousCoachApplicationId);
    if (prevCoachUserId) {
      const prevCoachTitle = "Batch Assignment Updated 📋";
      const prevCoachBody = `You have been unassigned from batch "${batchName}".`;

      const created = await createInAppNotificationIdempotent(
        prevCoachUserId,
        prevCoachTitle,
        prevCoachBody,
        `coach_unassign:${batchId}:${previousCoachApplicationId}`
      );
      if (created) previousCoachNotified = true;

      try {
        await pushNotificationService.sendToUser(
          prevCoachUserId,
          {
            title: prevCoachTitle,
            body: prevCoachBody,
            data: {
              type: "SCHEDULE_CHANGE",
              deepLink: "selffits://dashboard/coach",
              batchId,
            },
          },
          {
            persistInApp: false,
            deduplicationKey: `push:prev_coach_unassign:${batchId}:${previousCoachApplicationId}`,
          }
        );
      } catch (pushErr) {
        console.warn(`Failed to dispatch coach unassign push for batch ${batchId}:`, pushErr);
      }
    }
  }

  return { studentsNotified, newCoachNotified, previousCoachNotified };
}

// =========================================================================
// 4. STUDENT BATCH ASSIGNMENT & REMOVAL NOTIFICATIONS
// =========================================================================

export interface StudentBatchAssignmentParams {
  batchId: string;
  batchName: string;
  dayCombination: string;
  clockTiming: string;
  studentUserId: string;
  studentName?: string;
  coachApplicationId?: string;
}

export async function notifyBatchStudentAssignment(params: StudentBatchAssignmentParams): Promise<{
  studentNotified: boolean;
  coachNotified: boolean;
}> {
  const { batchId, batchName, dayCombination, clockTiming, studentUserId, studentName = "A student", coachApplicationId } = params;
  const refKey = `student_assign:${batchId}:${studentUserId}`;

  let studentNotified = false;
  let coachNotified = false;

  // 1. Notify Student
  const studentTitle = "Assigned to Class Batch 🥋";
  const studentBody = `You have been assigned to batch "${batchName}" (${dayCombination} at ${clockTiming}). Get ready for class!`;

  const studentCreated = await createInAppNotificationIdempotent(studentUserId, studentTitle, studentBody, refKey);
  if (studentCreated) studentNotified = true;

  try {
    await pushNotificationService.sendToUser(
      studentUserId,
      {
        title: studentTitle,
        body: studentBody,
        data: {
          type: "ENROLLMENT_UPDATE",
          deepLink: "selffits://dashboard/student",
          batchId,
          dayCombination,
          clockTiming,
        },
      },
      {
        persistInApp: false,
        deduplicationKey: `push:student_assign:${batchId}:${studentUserId}`,
      }
    );
  } catch (pushErr) {
    console.warn(`Failed to dispatch batch assignment push to student ${studentUserId}:`, pushErr);
  }

  // 2. Notify Coach
  if (coachApplicationId) {
    const coachUserId = await resolveCoachUserId(coachApplicationId);
    if (coachUserId) {
      const coachTitle = "New Student in Batch 🥋";
      const coachBody = `Student ${studentName} has been assigned to your batch "${batchName}".`;

      const coachCreated = await createInAppNotificationIdempotent(coachUserId, coachTitle, coachBody, refKey);
      if (coachCreated) coachNotified = true;

      try {
        await pushNotificationService.sendToUser(
          coachUserId,
          {
            title: coachTitle,
            body: coachBody,
            data: {
              type: "ANNOUNCEMENT",
              deepLink: "selffits://dashboard/coach",
              batchId,
            },
          },
          {
            persistInApp: false,
            deduplicationKey: `push:coach_student_assigned:${batchId}:${studentUserId}`,
          }
        );
      } catch (pushErr) {
        console.warn(`Failed to dispatch student assigned push to coach for batch ${batchId}:`, pushErr);
      }
    }
  }

  return { studentNotified, coachNotified };
}

export interface StudentBatchRemovalParams {
  batchId: string;
  batchName: string;
  studentUserId: string;
}

export async function notifyBatchStudentRemoval(params: StudentBatchRemovalParams): Promise<boolean> {
  const { batchId, batchName, studentUserId } = params;
  const refKey = `student_remove:${batchId}:${studentUserId}`;

  const title = "Removed from Class Batch 📋";
  const body = `You have been unassigned from batch "${batchName}". Please consult your dashboard to select another batch.`;

  const created = await createInAppNotificationIdempotent(studentUserId, title, body, refKey);

  try {
    await pushNotificationService.sendToUser(
      studentUserId,
      {
        title,
        body,
        data: {
          type: "SCHEDULE_CHANGE",
          deepLink: "selffits://dashboard/student",
          batchId,
        },
      },
      {
        persistInApp: false,
        deduplicationKey: `push:student_remove:${batchId}:${studentUserId}`,
      }
    );
  } catch (pushErr) {
    console.warn(`Failed to dispatch student removal push to student ${studentUserId}:`, pushErr);
  }

  return created;
}

// =========================================================================
// 5. BATCH CREATION NOTIFICATION
// =========================================================================

export interface BatchCreationParams {
  batchId: string;
  batchName: string;
  dayCombination: string;
  clockTiming: string;
  coachApplicationId: string;
}

export async function notifyBatchCreation(params: BatchCreationParams): Promise<boolean> {
  const { batchId, batchName, dayCombination, clockTiming, coachApplicationId } = params;
  const refKey = `batch_create:${batchId}`;

  const coachUserId = await resolveCoachUserId(coachApplicationId);
  if (!coachUserId) return false;

  const title = "New Class Batch Created 🥋";
  const body = `A new batch "${batchName}" has been created and assigned to you (${dayCombination} at ${clockTiming}).`;

  const created = await createInAppNotificationIdempotent(coachUserId, title, body, refKey);

  try {
    await pushNotificationService.sendToUser(
      coachUserId,
      {
        title,
        body,
        data: {
          type: "SCHEDULE_CHANGE",
          deepLink: "selffits://dashboard/coach",
          batchId,
          dayCombination,
          clockTiming,
        },
      },
      {
        persistInApp: false,
        deduplicationKey: `push:batch_create:${batchId}`,
      }
    );
  } catch (pushErr) {
    console.warn(`Failed to dispatch batch creation push to coach for batch ${batchId}:`, pushErr);
  }

  return created;
}

