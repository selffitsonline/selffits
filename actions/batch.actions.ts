"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const TIME_SLOT_MAP: Record<string, string> = {
  "1st Batch": "05:15 PM to 06:00 PM (GMT)",
  "2nd Batch": "06:15 PM to 07:00 PM (GMT)",
  "3rd Batch": "07:15 PM to 08:00 PM (GMT)",
  "Junior Batch 1": "04:00 PM to 04:45 PM (GMT)",
  "Junior Batch 2": "05:00 PM to 05:45 PM (GMT)",
  "Ladies Morning Batch": "10:00 AM to 10:45 AM (GMT)",
  "Ladies Evening Batch": "04:30 PM to 05:15 PM (GMT)",
  "Morning Batch": "09:00 AM to 09:45 AM (GMT)",
  "Afternoon Shred Batch": "01:30 PM to 02:30 PM (GMT)",
  "Evening Burn Batch": "05:00 PM to 06:00 PM (GMT)",
  Morning: "09:00 AM to 09:45 AM (GMT)",
  Evening: "04:00 PM to 04:45 PM (GMT)",
  Night: "08:00 PM to 08:45 PM (GMT)",
};

const TIME_SLOTS = [
  "1st Batch",
  "2nd Batch",
  "3rd Batch",
  "Junior Batch 1",
  "Junior Batch 2",
  "Ladies Morning Batch",
  "Ladies Evening Batch",
  "Morning Batch",
  "Afternoon Shred Batch",
  "Evening Burn Batch",
  "Morning",
  "Evening",
  "Night",
];

const DAY_COMBINATIONS = [
  "5 Days / Week (Monday to Friday)",
  "5 Days / Week (Tuesday to Saturday)",
  "5 Days / Week (Sunday to Thursday)",
  "3 Days / Week (Mon, Wed, Fri)",
  "3 Days / Week (Tue, Thu, Sat)",
  "3 Days / Week (Sun, Wed, Sat)",
  "2 Days / Week (Sat, Sun)",
  "Sunday & Wednesday",
  "Monday & Thursday",
  "Saturday & Tuesday",
];

// Helper to format program level or tier name
function getProgramLevelName(tierType?: string | null, planName?: string | null) {
  if (planName && planName.trim() && !planName.toLowerCase().includes("belt") && !planName.toLowerCase().includes("challenge")) return planName.trim();
  if (!tierType) return "Standard Plan";
  switch (tierType) {
    case "YELLOW_BELT": return "1 Day / Week";
    case "BLUE_BELT": return "3 Days / Week";
    case "PURPLE_BELT": return "4 Days / Week";
    case "BROWN_BELT": return "5 Days / Week";
    case "CHALLENGE_8": return "1 Day / Week";
    case "CHALLENGE_24": return "3 Days / Week";
    case "CHALLENGE_48": return "4 Days / Week";
    case "TRANSFORMATION_96": return "5 Days / Week";
    default: return tierType.replace(/_/g, " ");
  }
}

// 1. FETCH ALL BATCHES
export async function getAdminBatchesAction() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const batches = await db.batch.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        program: true,
        membershipPlan: true,
        coach: true,
        students: {
          include: {
            user: {
              include: {
                studentProfile: true,
                enrollments: {
                  where: { status: "ACTIVE" },
                  include: { membershipPlan: true },
                },
              },
            },
          },
        },
      },
    });

    const formattedBatches = batches.map((b) => {
      const studentCount = b.students.length;
      const maxCap = b.maxCapacity || 8;
      const availableSeats = Math.max(0, maxCap - studentCount);

      // Auto update status representation
      let computedStatus = b.status;
      if (b.status !== "INACTIVE") {
        if (studentCount >= maxCap) {
          computedStatus = "FULL";
        } else {
          computedStatus = "ACTIVE";
        }
      }

      const coachDisciplines = Array.isArray(b.coach.disciplines)
        ? (b.coach.disciplines as string[])
        : [];

      const assignedStudents = b.students.map((bs) => {
        const activeEnr = bs.user.enrollments[0];
        const enrDate = activeEnr
          ? activeEnr.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : bs.user.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const enrTime = activeEnr
          ? activeEnr.createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
          : bs.user.createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

        return {
          id: bs.user.id,
          batchStudentId: bs.id,
          name: bs.user.name,
          email: bs.user.email,
          phone: bs.user.studentProfile?.phone || "Not provided",
          programTitle: b.program.title,
          levelName: getProgramLevelName(b.membershipPlan?.tierType, b.membershipPlan?.name),
          enrollmentStatus: activeEnr ? "ACTIVE" : "UNENROLLED",
          joinedTimestamp: `Joined: ${enrDate} • ${enrTime}`,
          assignedAt: bs.assignedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        };
      });

      const examDateFormatted = b.examDate
        ? b.examDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : null;
      const examDateISO = b.examDate ? b.examDate.toISOString().split("T")[0] : null;

      return {
        id: b.id,
        batchId: b.batchId,
        name: b.name,
        programId: b.programId,
        programTitle: b.program.title,
        programCategory: b.program.category,
        targetAudience: b.program.targetAudience,
        membershipPlanId: b.membershipPlanId || null,
        levelName: getProgramLevelName(b.membershipPlan?.tierType, b.membershipPlan?.name),
        beltLevel: b.beltLevel || "Yellow Belt",
        coachId: b.coachId,
        coachName: b.coach.fullName,
        coachEmail: b.coach.email,
        coachPhone: b.coach.phone,
        coachRank: b.coach.highestRank || "Certified Coach",
        coachDisciplines: coachDisciplines.length > 0 ? coachDisciplines.join(", ") : "Martial Arts & Fitness",
        dayCombination: b.dayCombination,
        timeSlot: b.timeSlot,
        clockTiming: b.clockTiming,
        meetingUrl: b.meetingUrl || null,
        examDate: examDateFormatted,
        examDateISO,
        maxCapacity: maxCap,
        studentCount,
        availableSeats,
        capacityLabel: `${studentCount} / ${maxCap}`,
        status: computedStatus,
        createdAt: b.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        createdAtISO: b.createdAt.toISOString(),
        students: assignedStudents,
      };
    });

    return { success: true, batches: formattedBatches };
  } catch (err: any) {
    console.error("getAdminBatchesAction error:", err);
    return { success: false, error: "Failed to fetch batches." };
  }
}

// 2. FETCH FORM DATA FOR BATCH CREATION & ASSIGNMENTS
export async function getBatchFormDataAction() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const [programs, membershipPlans, activeCoaches, activeStudents] = await Promise.all([
      db.program.findMany({
        where: { isActive: true },
        orderBy: { title: "asc" },
      }),
      db.membershipPlan.findMany({
        where: { isActive: true },
        include: { program: true },
        orderBy: { priceINR: "asc" },
      }),
      db.coachApplication.findMany({
        where: { status: "APPROVED" },
        orderBy: { fullName: "asc" },
      }),
      db.user.findMany({
        where: { role: "STUDENT" },
        include: {
          studentProfile: true,
          enrollments: {
            where: { status: "ACTIVE" },
            include: {
              membershipPlan: {
                include: { program: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const formattedCoaches = activeCoaches.map((c) => {
      const disc = Array.isArray(c.disciplines) ? (c.disciplines as string[]) : [];
      return {
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        highestRank: c.highestRank || "Certified Instructor",
        disciplines: disc.length > 0 ? disc.join(", ") : "Martial Arts & Fitness",
        rawDisciplines: disc,
      };
    });

    const formattedPrograms = programs.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      targetAudience: p.targetAudience,
    }));

    const formattedPlans = membershipPlans.map((mp) => ({
      id: mp.id,
      programId: mp.programId,
      name: mp.name,
      levelName: getProgramLevelName(mp.tierType, mp.name),
      tierType: mp.tierType,
    }));

    const formattedStudents = activeStudents.map((std) => {
      const activeEnr = std.enrollments[0];
      const prg = activeEnr?.membershipPlan?.program;
      const mp = activeEnr?.membershipPlan;

      return {
        id: std.id,
        name: std.name,
        email: std.email,
        phone: std.studentProfile?.phone || "Not provided",
        activeProgramId: prg?.id || null,
        activeProgramTitle: prg?.title || "Unenrolled",
        activePlanId: mp?.id || null,
        activeLevelName: getProgramLevelName(mp?.tierType, mp?.name),
        isEnrolled: !!activeEnr,
      };
    });

    return {
      success: true,
      data: {
        programs: formattedPrograms,
        plans: formattedPlans,
        coaches: formattedCoaches,
        students: formattedStudents,
        dayCombinations: DAY_COMBINATIONS,
        timeSlots: TIME_SLOTS,
      },
    };
  } catch (err: any) {
    console.error("getBatchFormDataAction error:", err);
    return { success: false, error: "Failed to load batch form data." };
  }
}

// 3. CREATE BATCH
export async function createBatchAction(data: {
  name: string;
  programId: string;
  membershipPlanId?: string;
  beltLevel: string;
  coachId: string;
  dayCombination: string;
  timeSlot: string;
  clockTiming?: string;
  meetingUrl?: string;
  examDate?: string | null;
  maxCapacity?: number;
}) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    if (!data.name || !data.programId || !data.coachId || !data.dayCombination || !data.timeSlot) {
      return { success: false, error: "All required batch fields must be specified." };
    }

    const clockTiming = data.clockTiming || TIME_SLOT_MAP[data.timeSlot] || `${data.timeSlot} (GMT)`;
    const maxCap = Math.max(1, Number(data.maxCapacity) || 8);

    let parsedExamDate: Date | null = null;
    if (data.examDate) {
      const d = new Date(data.examDate);
      if (isNaN(d.getTime())) {
        return { success: false, error: "Invalid examination date format." };
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) {
        return { success: false, error: "Scheduled examination date cannot be in the past. Please select today or a future date." };
      }
      parsedExamDate = d;
    }

    // Coach Schedule Conflict Validation
    const conflictingBatch = await db.batch.findFirst({
      where: {
        coachId: data.coachId,
        dayCombination: data.dayCombination,
        timeSlot: data.timeSlot,
        status: { not: "INACTIVE" },
      },
      include: {
        coach: true,
      },
    });

    if (conflictingBatch) {
      return {
        success: false,
        error: `Schedule Conflict: Coach ${conflictingBatch.coach.fullName} is already assigned to batch "${conflictingBatch.name}" on ${data.dayCombination} during ${data.timeSlot} slot (${conflictingBatch.clockTiming}).`,
      };
    }

    // Generate unique batch ID e.g. BATCH-83910
    const prg = await db.program.findUnique({ where: { id: data.programId } });
    const prgPrefix = prg?.title ? prg.title.slice(0, 3).toUpperCase() : "BAT";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedBatchId = `BATCH-${prgPrefix}-${randomNum}`;

    await db.batch.create({
      data: {
        batchId: generatedBatchId,
        name: data.name.trim(),
        programId: data.programId,
        membershipPlanId: data.membershipPlanId || null,
        beltLevel: data.beltLevel || "Yellow Belt",
        coachId: data.coachId,
        dayCombination: data.dayCombination,
        timeSlot: data.timeSlot,
        clockTiming,
        meetingUrl: data.meetingUrl?.trim() || null,
        examDate: parsedExamDate,
        maxCapacity: maxCap,
        status: "ACTIVE",
      },
    });

    revalidatePath("/admin/batches");
    revalidatePath("/admin/student-progress");
    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/programs");
    revalidatePath("/dashboard/live");

    return { success: true, message: `Batch "${data.name}" created successfully with ID ${generatedBatchId}.` };
  } catch (err: any) {
    console.error("createBatchAction error:", err);
    return { success: false, error: "Failed to create batch." };
  }
}

// 4. UPDATE BATCH DETAILS
export async function updateBatchAction(
  batchId: string,
  data: {
    name?: string;
    programId?: string;
    membershipPlanId?: string;
    beltLevel?: string;
    coachId?: string;
    dayCombination?: string;
    timeSlot?: string;
    clockTiming?: string;
    meetingUrl?: string | null;
    examDate?: string | null;
    maxCapacity?: number;
    status?: "ACTIVE" | "FULL" | "INACTIVE";
  }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const existingBatch = await db.batch.findUnique({
      where: { id: batchId },
      include: { students: true },
    });

    if (!existingBatch) {
      return { success: false, error: "Batch not found." };
    }

    const coachId = data.coachId || existingBatch.coachId;
    const dayCombination = data.dayCombination || existingBatch.dayCombination;
    const timeSlot = data.timeSlot || existingBatch.timeSlot;

    // Check Schedule Conflict if coach, day, or time slot changed
    if (
      coachId !== existingBatch.coachId ||
      dayCombination !== existingBatch.dayCombination ||
      timeSlot !== existingBatch.timeSlot
    ) {
      const conflict = await db.batch.findFirst({
        where: {
          id: { not: batchId },
          coachId,
          dayCombination,
          timeSlot,
          status: { not: "INACTIVE" },
        },
        include: { coach: true },
      });

      if (conflict) {
        return {
          success: false,
          error: `Schedule Conflict: Coach ${conflict.coach.fullName} is already assigned to active batch "${conflict.name}" on ${dayCombination} during ${timeSlot} slot.`,
        };
      }
    }

    const clockTiming = data.clockTiming || TIME_SLOT_MAP[timeSlot] || existingBatch.clockTiming;
    const maxCapacity = data.maxCapacity !== undefined ? Math.max(1, Number(data.maxCapacity)) : existingBatch.maxCapacity;
    const studentCount = existingBatch.students.length;

    let targetStatus = data.status || existingBatch.status;
    if (targetStatus !== "INACTIVE") {
      if (studentCount >= maxCapacity) {
        targetStatus = "FULL";
      } else {
        targetStatus = "ACTIVE";
      }
    }

    const meetingUrl = data.meetingUrl !== undefined
      ? (data.meetingUrl && data.meetingUrl.trim() !== "" ? data.meetingUrl.trim() : null)
      : existingBatch.meetingUrl;

    let parsedExamDate = existingBatch.examDate;
    if (data.examDate !== undefined) {
      if (!data.examDate || typeof data.examDate !== "string" || data.examDate.trim() === "") {
        parsedExamDate = null;
      } else {
        const d = new Date(data.examDate);
        if (isNaN(d.getTime())) {
          return { success: false, error: "Invalid examination date format." };
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (d < today) {
          return { success: false, error: "Scheduled examination date cannot be in the past. Please select today or a future date." };
        }
        parsedExamDate = d;
      }
    }

    const targetProgramId = data.programId || existingBatch.programId;
    const targetCoachId = coachId;
    const membershipPlanId = data.membershipPlanId !== undefined
      ? (data.membershipPlanId && data.membershipPlanId.trim() !== "" ? data.membershipPlanId : null)
      : existingBatch.membershipPlanId;

    const updateData: any = {
      name: data.name && data.name.trim() !== "" ? data.name.trim() : existingBatch.name,
      beltLevel: data.beltLevel || existingBatch.beltLevel || "Yellow Belt",
      dayCombination,
      timeSlot,
      clockTiming,
      meetingUrl,
      examDate: parsedExamDate,
      maxCapacity,
      status: targetStatus,
    };

    if (targetProgramId) {
      updateData.program = { connect: { id: targetProgramId } };
    }

    if (targetCoachId) {
      updateData.coach = { connect: { id: targetCoachId } };
    }

    if (membershipPlanId) {
      updateData.membershipPlan = { connect: { id: membershipPlanId } };
    } else if (data.membershipPlanId === null || data.membershipPlanId === "") {
      updateData.membershipPlan = { disconnect: true };
    }

    await db.batch.update({
      where: { id: batchId },
      data: updateData,
    });

    revalidatePath("/admin/batches");
    revalidatePath("/admin/student-progress");
    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/programs");
    revalidatePath("/dashboard/live");

    return { success: true, message: "Batch updated successfully." };
  } catch (err: any) {
    console.error("updateBatchAction error:", err);
    return { success: false, error: err?.message || "Failed to update batch." };
  }
}

// 5. ASSIGN STUDENT TO BATCH
export async function assignStudentToBatchAction(batchId: string, userId: string) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const batch = await db.batch.findUnique({
      where: { id: batchId },
      include: {
        students: true,
        program: true,
      },
    });

    if (!batch) {
      return { success: false, error: "Target batch not found." };
    }

    // Check capacity
    if (batch.students.length >= batch.maxCapacity) {
      // Mark as full
      await db.batch.update({ where: { id: batchId }, data: { status: "FULL" } });
      return { success: false, error: `Batch "${batch.name}" is FULL (${batch.students.length}/${batch.maxCapacity} seats filled). Cannot assign more students.` };
    }

    // Check existing assignment
    const existingAssignment = await db.batchStudent.findUnique({
      where: {
        batchId_userId: { batchId, userId },
      },
    });

    if (existingAssignment) {
      return { success: false, error: "Student is already assigned to this batch." };
    }

    // Check student program eligibility
    const student = await db.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          where: { status: "ACTIVE" },
          include: { membershipPlan: true },
        },
      },
    });

    if (!student) {
      return { success: false, error: "Student user not found." };
    }

    const activeEnrollment = student.enrollments[0];
    if (!activeEnrollment) {
      return { success: false, error: "Student does not have an active course enrollment." };
    }

    if (activeEnrollment.membershipPlan?.programId !== batch.programId) {
      return { success: false, error: `Incompatible Program: Student is enrolled in a different program than batch "${batch.program.title}".` };
    }

    // Perform Assignment
    await db.batchStudent.create({
      data: {
        batchId,
        userId,
      },
    });

    // Check new count to see if full
    const newCount = batch.students.length + 1;
    if (newCount >= batch.maxCapacity) {
      await db.batch.update({
        where: { id: batchId },
        data: { status: "FULL" },
      });
    }

    revalidatePath("/admin/batches");
    revalidatePath("/admin/students");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/programs");
    revalidatePath("/dashboard/live");

    return { success: true, message: `Student ${student.name} assigned to batch "${batch.name}" successfully!` };
  } catch (err: any) {
    console.error("assignStudentToBatchAction error:", err);
    return { success: false, error: "Failed to assign student to batch." };
  }
}

// 6. REMOVE STUDENT FROM BATCH
export async function removeStudentFromBatchAction(batchId: string, userId: string) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    await db.batchStudent.deleteMany({
      where: {
        batchId,
        userId,
      },
    });

    // Recalculate capacity status
    const batch = await db.batch.findUnique({
      where: { id: batchId },
      include: { students: true },
    });

    if (batch && batch.status === "FULL" && batch.students.length < batch.maxCapacity) {
      await db.batch.update({
        where: { id: batchId },
        data: { status: "ACTIVE" },
      });
    }

    revalidatePath("/admin/batches");
    revalidatePath("/admin/students");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/programs");
    revalidatePath("/dashboard/live");

    return { success: true, message: "Student removed from batch." };
  } catch (err: any) {
    console.error("removeStudentFromBatchAction error:", err);
    return { success: false, error: "Failed to remove student from batch." };
  }
}

// 7. DEACTIVATE OR DELETE BATCH
export async function deactivateOrDeleteBatchAction(batchId: string, deletePermanently: boolean = false) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    if (deletePermanently) {
      await db.batch.delete({ where: { id: batchId } });
    } else {
      await db.batch.update({
        where: { id: batchId },
        data: { status: "INACTIVE" },
      });
    }

    revalidatePath("/admin/batches");
    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/programs");
    revalidatePath("/dashboard/live");

    return {
      success: true,
      message: deletePermanently ? "Batch permanently deleted." : "Batch status updated to Inactive.",
    };
  } catch (err: any) {
    console.error("deactivateOrDeleteBatchAction error:", err);
    return { success: false, error: "Failed to update batch." };
  }
}
// Centralized Server-Side Batch & Meeting Readiness Calculator
export async function getCentralClassReadinessForUser(userId: string) {
  const assignment = await db.batchStudent.findFirst({
    where: { userId },
    include: {
      batch: {
        include: {
          program: true,
          membershipPlan: true,
          coach: true,
          students: true,
        },
      },
    },
  });

  if (!assignment || !assignment.batch) {
    return {
      hasBatch: false,
      batchId: null,
      batchCode: null,
      batchName: null,
      programTitle: null,
      programCategory: null,
      levelName: null,
      coachName: null,
      coachRank: null,
      coachDisciplines: null,
      dayCombination: null,
      timeSlot: null,
      clockTiming: null,
      meetingUrl: null,
      capacityLabel: null,
      batchStatus: null,
      isReady: false,
    };
  }

  const b = assignment.batch;
  const hasValidMeetingUrl = !!(b.meetingUrl && b.meetingUrl.trim() !== "");
  const isBatchActive = b.status === "ACTIVE" || b.status === "FULL";
  const isReady = hasValidMeetingUrl && isBatchActive;

  const coachDisciplines = Array.isArray(b.coach.disciplines) ? (b.coach.disciplines as string[]) : [];

  return {
    hasBatch: true,
    batchId: b.id,
    batchCode: b.batchId,
    batchName: b.name,
    programTitle: b.program.title,
    programCategory: b.program.category,
    levelName: getProgramLevelName(b.membershipPlan?.tierType, b.membershipPlan?.name),
    coachName: b.coach.fullName,
    coachRank: b.coach.highestRank || "Certified Instructor",
    coachDisciplines: coachDisciplines.length > 0 ? coachDisciplines.join(", ") : "Martial Arts & Fitness",
    dayCombination: b.dayCombination,
    timeSlot: b.timeSlot,
    clockTiming: b.clockTiming,
    meetingUrl: b.meetingUrl || null,
    capacityLabel: `${b.students.length} / ${b.maxCapacity}`,
    batchStatus: b.status,
    isReady: isReady,
    assignedAt: assignment.assignedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };
}

export async function getStudentBatchInfoAction() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized access." };
    }

    const readiness = await getCentralClassReadinessForUser(session.user.id);

    if (!readiness.hasBatch) {
      return { success: true, hasBatch: false, batch: null, isReady: false };
    }

    return {
      success: true,
      hasBatch: true,
      isReady: readiness.isReady,
      batch: readiness,
    };
  } catch (err: any) {
    console.error("getStudentBatchInfoAction error:", err);
    return { success: false, error: "Failed to fetch student batch info." };
  }
}

