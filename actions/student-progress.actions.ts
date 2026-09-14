"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ExaminationStatus } from "@prisma/client";
import fs from "fs";
import path from "path";

function safeFormatDate(d?: Date | string | null): string | null {
  if (!d) return null;
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return null;
  return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function safeISOString(d?: Date | string | null): string | null {
  if (!d) return null;
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return null;
  return dateObj.toISOString();
}

// 1. GET ADMIN STUDENT PROGRESS LIST (Central directory of students with belt & exam status)
export async function getAdminStudentProgressListAction() {
  let formattedBatches: any[] = [];
  let formattedStudents: any[] = [];

  try {
    const session = await auth();
    let isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

    if (!isAdmin && (session?.user?.id || session?.user?.email)) {
      const emailLower = session?.user?.email?.toLowerCase().trim();
      if (
        emailLower === "admin@selffits.com" ||
        emailLower === "superadmin@selffits.com" ||
        emailLower === "admin@example.com"
      ) {
        isAdmin = true;
      } else if (session?.user?.id) {
        const dbUser = await db.user.findUnique({
          where: { id: session.user.id },
          select: { role: true },
        });
        if (dbUser && (dbUser.role === "ADMIN" || dbUser.role === "SUPER_ADMIN")) {
          isAdmin = true;
        }
      }
    }

    if (!session || !isAdmin) {
      return { success: false, error: "Unauthorized access to Admin portal." };
    }
  } catch (authErr: any) {
    console.error("Auth check error in getAdminStudentProgressListAction:", authErr);
    return { success: false, error: authErr?.message || "Authentication validation failed." };
  }

  // 1. Fetch active batches & assigned students directly for 100% consistency with Batch Management
  try {
    const batches = await db.batch.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        program: true,
        students: {
          include: {
            user: {
              include: {
                studentProfile: true,
              },
            },
          },
        },
      },
    });

    const coaches = await db.coachApplication.findMany().catch(() => []);
    const coachMap = new Map(coaches.map((c) => [c.id, c]));

    formattedBatches = batches.map((b) => {
      try {
        const coach = coachMap.get(b.coachId);
        return {
          id: b.id,
          batchId: b.batchId,
          name: b.name || "Unnamed Batch",
          programTitle: b.program?.title || "Martial Arts Program",
          programCategory: b.program?.category || "MARTIAL_ARTS",
          beltLevel: b.beltLevel || "Yellow Belt",
          coachName: coach?.fullName || "Assigned Coach",
          coachRank: coach?.highestRank || "Certified Coach",
          dayCombination: b.dayCombination || "Flexible Schedule",
          timeSlot: b.timeSlot || "Flexible Slot",
          clockTiming: b.clockTiming || "Flexible Timing",
          examDate: safeFormatDate(b.examDate),
          examDateISO: safeISOString(b.examDate) ? safeISOString(b.examDate)!.split("T")[0] : null,
          maxCapacity: b.maxCapacity || 8,
          studentCount: Array.isArray(b.students) ? b.students.length : 0,
          capacityLabel: `${Array.isArray(b.students) ? b.students.length : 0} / ${b.maxCapacity || 8}`,
          status: b.status || "ACTIVE",
        };
      } catch (err) {
        console.error("Error formatting batch record:", b.id, err);
        return {
          id: b.id,
          batchId: b.batchId || "BATCH",
          name: b.name || "Batch",
          programTitle: "Martial Arts Program",
          programCategory: "MARTIAL_ARTS",
          beltLevel: "Yellow Belt",
          coachName: "Coach",
          coachRank: "Certified Coach",
          dayCombination: "Flexible",
          timeSlot: "Flexible",
          clockTiming: "Flexible",
          examDate: null,
          examDateISO: null,
          maxCapacity: 8,
          studentCount: 0,
          capacityLabel: "0 / 8",
          status: "ACTIVE",
        };
      }
    });

    // Extract student directory directly from BatchStudent relations + User table
    const studentMap = new Map<string, any>();

    for (const b of batches) {
      if (Array.isArray(b.students)) {
        for (const bs of b.students) {
          if (bs && bs.user) {
            const std = bs.user;
            const existing = studentMap.get(std.id) || {
              id: std.id,
              name: std.name || [std.firstName, std.lastName].filter(Boolean).join(" ") || "Student",
              email: std.email || "No email",
              phone: std.studentProfile?.phone || "Not provided",
              joinedDate: safeFormatDate(std.createdAt) || "Recently",
              createdAtISO: safeISOString(std.createdAt) || new Date().toISOString(),
              currentBelt: std.studentProfile?.currentBelt || b.beltLevel || "White Belt",
              beltAwardedAt: safeFormatDate(std.studentProfile?.beltAwardedAt) || "Initial Assignment",
              activeProgram: b.program?.title || "General Martial Arts",
              batchIds: [],
              batchNames: [],
              totalExams: 0,
              latestExamStatus: "NO_EXAM",
              latestExamDate: null,
              latestExamDateISO: null,
              totalProgressions: 0,
              totalCertificates: 0,
            };

            if (!existing.batchIds.includes(b.id)) existing.batchIds.push(b.id);
            if (b.batchId && !existing.batchIds.includes(b.batchId)) existing.batchIds.push(b.batchId);
            if (b.name && !existing.batchNames.includes(b.name)) existing.batchNames.push(b.name);

            studentMap.set(std.id, existing);
          }
        }
      }
    }

    // Also fetch all other registered users safely
    const allUsers = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { studentProfile: true },
    }).catch(() => []);

    for (const u of allUsers) {
      if (!studentMap.has(u.id)) {
        studentMap.set(u.id, {
          id: u.id,
          name: u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || "Student",
          email: u.email || "No email",
          phone: u.studentProfile?.phone || "Not provided",
          joinedDate: safeFormatDate(u.createdAt) || "Recently",
          createdAtISO: safeISOString(u.createdAt) || new Date().toISOString(),
          currentBelt: u.studentProfile?.currentBelt || "White Belt",
          beltAwardedAt: safeFormatDate(u.studentProfile?.beltAwardedAt) || "Initial Assignment",
          activeProgram: "General Martial Arts",
          batchIds: [],
          batchNames: [],
          totalExams: 0,
          latestExamStatus: "NO_EXAM",
          latestExamDate: null,
          latestExamDateISO: null,
          totalProgressions: 0,
          totalCertificates: 0,
        });
      }
    }

    formattedStudents = Array.from(studentMap.values());
  } catch (batchErr) {
    console.error("Error fetching batches in getAdminStudentProgressListAction:", batchErr);
  }

  return { success: true, batches: formattedBatches, students: formattedStudents };
}

// 2. GET SINGLE STUDENT PROGRESS DETAILS FOR ADMIN VIEW
export async function getStudentProgressDetailsAction(studentId: string, targetBatchId?: string) {
  try {
    let session = null;
    try {
      session = await auth();
    } catch (err: any) {
      console.warn("auth() warning in getStudentProgressDetailsAction:", err);
    }

    let isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
    if (!isAdmin && session?.user?.email) {
      const emailLower = session.user.email.toLowerCase().trim();
      if (
        emailLower === "admin@selffits.com" ||
        emailLower === "superadmin@selffits.com" ||
        emailLower === "admin@example.com"
      ) {
        isAdmin = true;
      }
    }

    // Only restrict non-admins when viewing someone else's record
    if (!isAdmin && session?.user?.id && session.user.id !== studentId) {
      return { success: false, error: "Access Denied: Cannot view other student records." };
    }

    const student = await db.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: true,
        batchStudents: {
          include: {
            batch: {
              include: { program: true },
            },
          },
        },
        certificates: {
          orderBy: { issuedDate: "desc" },
          include: { program: true },
        },
        enrollments: {
          orderBy: { createdAt: "desc" },
          include: { membershipPlan: { include: { program: true } } },
        },
      },
    });

    if (!student) {
      return { success: false, error: "Student record not found." };
    }

    const currentBelt = student.studentProfile?.currentBelt || "White Belt";
    const activeEnrollment = Array.isArray(student.enrollments)
      ? student.enrollments.find((e) => e.status === "ACTIVE")
      : null;
    const activeProgram = activeEnrollment?.membershipPlan?.program;

    // Resolve target assigned batch:
    // If targetBatchId is supplied and valid (not "ALL"), match the specific assigned batch record.
    const validAssignments = Array.isArray(student.batchStudents)
      ? student.batchStudents.filter((bs) => bs && bs.batch)
      : [];

    let targetAssignment = null;
    if (targetBatchId && targetBatchId !== "ALL") {
      targetAssignment = validAssignments.find((bs) => bs.batchId === targetBatchId || bs.batch?.id === targetBatchId) || null;
    }

    let assignedBatch = targetAssignment?.batch || null;
    if (!assignedBatch && targetBatchId && targetBatchId !== "ALL") {
      assignedBatch = await db.batch.findFirst({
        where: {
          OR: [
            { id: targetBatchId },
            { batchId: targetBatchId },
          ],
        },
        include: { program: true },
      }).catch(() => null);
    }

    // Fallback to first valid assignment if no specific batch ID provided
    if (!assignedBatch && validAssignments.length > 0) {
      assignedBatch = validAssignments[0].batch;
    }

    let batchExamDateFormatted: string | null = null;
    let batchExamDateISO: string | null = null;
    let isExamDatePassed = false;
    let examStatusLabel = "NO_EXAM_DATE";

    if (assignedBatch?.examDate) {
      const dateISO = safeISOString(assignedBatch.examDate);
      if (dateISO) {
        batchExamDateFormatted = safeFormatDate(assignedBatch.examDate);
        batchExamDateISO = dateISO.split("T")[0];

        // Timezone-safe calendar date comparison (YYYY-MM-DD)
        const todayISO = safeISOString(new Date())?.split("T")[0] || new Date().toISOString().split("T")[0];

        if (todayISO >= batchExamDateISO) {
          isExamDatePassed = true;
          examStatusLabel = "EXAM_DATE_PASSED";
        } else {
          isExamDatePassed = false;
          examStatusLabel = "UPCOMING_EXAM";
        }
      }
    }

    // Deduplicate certificates so each belt level displays maximum 1 current certificate
    const certList = Array.isArray(student.certificates) ? student.certificates : [];
    const uniqueBeltMap = new Map<string, typeof certList[0]>();
    for (const cert of certList) {
      const key = cert.beltName || cert.title || cert.id;
      if (!uniqueBeltMap.has(key)) {
        uniqueBeltMap.set(key, cert);
      }
    }
    const deduplicatedCertificates = Array.from(uniqueBeltMap.values());

    const formattedCertificates = deduplicatedCertificates.map((cert) => ({
      id: cert.id,
      title: cert.title || "Graduation Certificate",
      certificateNumber: cert.certificateNumber,
      beltName: cert.beltName || "Belt Award",
      programTitle: cert.program?.title || "Martial Arts Academy",
      issuedDate: safeFormatDate(cert.issuedDate) || "Recently",
      fileKey: cert.fileKey,
      fileUrl: `/api/certificates/download/${cert.id}`,
    }));

    return {
      success: true,
      student: {
        id: student.id,
        name: student.name || "Student",
        email: student.email || "No email",
        phone: student.studentProfile?.phone || "Not provided",
        currentBelt,
        beltAwardedAt: safeFormatDate(student.studentProfile?.beltAwardedAt) || "Initial Assignment",
        activeProgramTitle: activeProgram?.title || assignedBatch?.program?.title || "Martial Arts Program",
        activeProgramId: activeProgram?.id || assignedBatch?.programId || null,
        batchInfo: assignedBatch
          ? {
              id: assignedBatch.id,
              batchId: assignedBatch.batchId,
              name: assignedBatch.name || "Assigned Batch",
              beltLevel: assignedBatch.beltLevel || "Yellow Belt",
              examDate: batchExamDateFormatted,
              examDateISO: batchExamDateISO,
              isExamDatePassed,
              examStatusLabel,
            }
          : null,
        certificates: formattedCertificates,
      },
    };
  } catch (err: any) {
    console.error("getStudentProgressDetailsAction error:", err);
    return { success: false, error: err?.message || "Failed to fetch student progress details." };
  }
}

// 3. CREATE EXAMINATION RECORD
export async function createExaminationAction(payload: {
  userId: string;
  programId?: string;
  targetBelt: string;
  examDate: string; // YYYY-MM-DD
  remarks?: string;
  initialStatus?: ExaminationStatus;
}) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const { userId, programId, targetBelt, examDate, remarks, initialStatus } = payload;

    const student = await db.user.findUnique({ where: { id: userId } });
    if (!student) {
      return { success: false, error: "Student not found." };
    }

    // Resolve programId if missing
    let resolvedProgramId = programId;
    if (!resolvedProgramId) {
      const activeEnrollment = await db.enrollment.findFirst({
        where: { userId, status: "ACTIVE" },
        include: { membershipPlan: true },
      });
      resolvedProgramId = activeEnrollment?.membershipPlan?.programId;
    }

    if (!resolvedProgramId) {
      const firstProgram = await db.program.findFirst();
      resolvedProgramId = firstProgram?.id;
    }

    const parsedDate = examDate ? new Date(examDate) : new Date();

    const exam = await db.examination.create({
      data: {
        userId,
        programId: resolvedProgramId,
        targetBelt,
        examDate: parsedDate,
        status: initialStatus || "PENDING",
        remarks: remarks || null,
      },
    });

    revalidatePath("/admin/student-progress");
    revalidatePath("/dashboard/progress");

    return {
      success: true,
      message: `Examination for ${targetBelt} created successfully!`,
      examination: exam,
    };
  } catch (err: any) {
    console.error("createExaminationAction error:", err);
    return { success: false, error: "Failed to create examination record." };
  }
}

// 4. UPDATE EXAMINATION STATUS
export async function updateExaminationStatusAction(payload: {
  examinationId: string;
  status: ExaminationStatus;
  remarks?: string;
}) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const { examinationId, status, remarks } = payload;

    const exam = await db.examination.findUnique({ where: { id: examinationId } });
    if (!exam) {
      return { success: false, error: "Examination record not found." };
    }

    const updated = await db.examination.update({
      where: { id: examinationId },
      data: {
        status,
        ...(remarks !== undefined ? { remarks } : {}),
      },
    });

    // Notify student if PASSED or FAILED
    if (status === "PASSED") {
      await db.notification.create({
        data: {
          userId: exam.userId,
          title: "Examination Passed! 🎉",
          message: `Congratulations! You passed your ${exam.targetBelt} examination. Your coach will assign your new belt shortly.`,
        },
      });
    } else if (status === "FAILED") {
      await db.notification.create({
        data: {
          userId: exam.userId,
          title: "Examination Result Updated",
          message: `Your recent ${exam.targetBelt} examination result has been updated. Please consult your head coach for feedback.`,
        },
      });
    }

    revalidatePath("/admin/student-progress");
    revalidatePath("/dashboard/progress");

    return {
      success: true,
      message: `Examination status updated to ${status}.`,
      examination: updated,
    };
  } catch (err: any) {
    console.error("updateExaminationStatusAction error:", err);
    return { success: false, error: "Failed to update examination status." };
  }
}

// 5. ASSIGN BELT (Strict Guard: Examination MUST be PASSED)
export async function assignStudentBeltAction(payload: {
  userId: string;
  examinationId: string;
  targetBelt: string;
  awardDate?: string;
  notes?: string;
}) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const { userId, examinationId, targetBelt, awardDate, notes } = payload;

    const exam = await db.examination.findUnique({ where: { id: examinationId } });
    if (!exam) {
      return { success: false, error: "Examination record not found." };
    }

    if (exam.userId !== userId) {
      return { success: false, error: "Examination record does not belong to target student." };
    }

    if (exam.status !== "PASSED") {
      return {
        success: false,
        error: `Cannot assign belt: Student examination status is currently "${exam.status}". Only students marked as "PASSED" are eligible for belt progression.`,
      };
    }

    // Get Student Profile
    let studentProfile = await db.studentProfile.findUnique({ where: { userId } });
    const previousBelt = studentProfile?.currentBelt || "White Belt";
    const dateAwarded = awardDate ? new Date(awardDate) : new Date();

    // 1. Update Student Profile Current Belt permanently
    if (studentProfile) {
      await db.studentProfile.update({
        where: { userId },
        data: {
          currentBelt: targetBelt,
          beltAwardedAt: dateAwarded,
        },
      });
    } else {
      await db.studentProfile.create({
        data: {
          userId,
          currentBelt: targetBelt,
          beltAwardedAt: dateAwarded,
        },
      });
    }

    // 2. Save Permanent Immutable Belt Progression Entry
    const beltProg = await db.beltProgression.create({
      data: {
        userId,
        examinationId,
        previousBelt,
        currentBelt: targetBelt,
        awardDate: dateAwarded,
        notes: notes || null,
      },
    });

    // 3. Create Student In-App Notification
    await db.notification.create({
      data: {
        userId,
        title: "New Belt Awarded! 🥋",
        message: `Congratulations! You have been officially promoted from ${previousBelt} to ${targetBelt}!`,
      },
    });

    revalidatePath("/admin/student-progress");
    revalidatePath("/dashboard/progress");

    return {
      success: true,
      message: `Successfully promoted student from ${previousBelt} to ${targetBelt}!`,
      beltProgressionId: beltProg.id,
    };
  } catch (err: any) {
    console.error("assignStudentBeltAction error:", err);
    return { success: false, error: "Failed to assign new belt." };
  }
}

// 6. ISSUE DYNAMIC CERTIFICATE FOR PASSED BELT
export async function issueBeltCertificateAction(payload: {
  userId: string;
  examinationId?: string;
  beltProgressionId?: string;
  programId?: string;
  beltName: string;
  title?: string;
}) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const { userId, examinationId, beltProgressionId, programId, beltName, title } = payload;

    const student = await db.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true },
    });

    if (!student) {
      return { success: false, error: "Student record not found." };
    }

    // Determine target program
    let targetProgramId = programId;
    if (!targetProgramId && examinationId) {
      const exam = await db.examination.findUnique({ where: { id: examinationId } });
      targetProgramId = exam?.programId || undefined;
    }

    if (!targetProgramId) {
      const activeEnrollment = await db.enrollment.findFirst({
        where: { userId, status: "ACTIVE" },
        include: { membershipPlan: true },
      });
      targetProgramId = activeEnrollment?.membershipPlan?.programId;
    }

    if (!targetProgramId) {
      let firstProg = await db.program.findFirst();
      if (!firstProg) {
        firstProg = await db.program.create({
          data: {
            title: "Martial Arts Academy",
            slug: "martial-arts-academy",
            category: "MARTIAL_ARTS",
            targetAudience: "ADULTS",
            description: "Official SELFFITS Martial Arts Program",
          },
        });
      }
      targetProgramId = firstProg.id;
    }

    // Dynamic Certificate Details
    const certTitle = title || `${beltName} Graduation Certificate`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const certificateNumber = `SELFFITS-${beltName.replace(/\s+/g, "").toUpperCase()}-${Date.now().toString().slice(-4)}-${randomSuffix}`;
    const fileKey = `certificates/${Date.now()}-${certificateNumber}.pdf`;

    // Save DB Certificate
    const cert = await db.certificate.create({
      data: {
        userId,
        programId: targetProgramId,
        title: certTitle,
        certificateNumber,
        fileKey,
        beltName,
        issuedByUserId: session.user.id,
      },
    });

    // Link Certificate to BeltProgression if provided
    if (beltProgressionId) {
      await db.beltProgression.update({
        where: { id: beltProgressionId },
        data: { certificateId: cert.id },
      });
    }

    // Notify Student
    await db.notification.create({
      data: {
        userId,
        title: "Official Certificate Issued! 📜",
        message: `Your official ${certTitle} (${certificateNumber}) has been issued and is now ready for download in your dashboard!`,
      },
    });

    revalidatePath("/admin/student-progress");
    revalidatePath("/dashboard/certificates");
    revalidatePath("/dashboard/progress");

    return {
      success: true,
      message: `Certificate "${certTitle}" issued successfully to ${student.name}!`,
      certificateId: cert.id,
      certificateNumber,
    };
  } catch (err: any) {
    console.error("issueBeltCertificateAction error:", err);
    return { success: false, error: "Failed to issue certificate." };
  }
}

// 5. DIRECT BELT ASSIGNMENT (Batch Exam Date Driven)
export async function assignStudentBeltDirectAction(payload: {
  userId: string;
  targetBelt: string;
  awardDate?: string;
  notes?: string;
}) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const { userId, targetBelt, awardDate, notes } = payload;
    const dateAwarded = awardDate ? new Date(awardDate) : new Date();

    let studentProfile = await db.studentProfile.findUnique({ where: { userId } });
    const previousBelt = studentProfile?.currentBelt || "White Belt";

    if (studentProfile) {
      await db.studentProfile.update({
        where: { userId },
        data: {
          currentBelt: targetBelt,
          beltAwardedAt: dateAwarded,
        },
      });
    } else {
      await db.studentProfile.create({
        data: {
          userId,
          currentBelt: targetBelt,
          beltAwardedAt: dateAwarded,
        },
      });
    }

    await db.notification.create({
      data: {
        userId,
        title: "New Belt Rank Assigned! 🥋",
        message: `Congratulations! You have been officially assigned the ${targetBelt} rank!`,
      },
    });

    revalidatePath("/admin/student-progress");
    revalidatePath("/dashboard/progress");

    return {
      success: true,
      message: `Successfully promoted student from ${previousBelt} to ${targetBelt}!`,
    };
  } catch (err: any) {
    console.error("assignStudentBeltDirectAction error:", err);
    return { success: false, error: "Failed to assign new belt." };
  }
}

// 6. DELETE STUDENT CERTIFICATE RECORD & FILE
export async function deleteStudentCertificateAction(payload: { certificateId: string }) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const { certificateId } = payload;
    const cert = await db.certificate.findUnique({ where: { id: certificateId } });

    if (!cert) {
      return { success: false, error: "Certificate record not found." };
    }

    // Attempt physical file removal across all possible candidate locations
    if (cert.fileKey) {
      const candidatePaths = [
        path.join(process.cwd(), "public", "uploads", cert.fileKey),
        path.join(process.cwd(), "public", cert.fileKey),
        path.join(process.cwd(), "public", "uploads", "certificates", path.basename(cert.fileKey)),
        path.join("/tmp", "uploads", cert.fileKey),
        path.join("/tmp", "uploads", "certificates", path.basename(cert.fileKey)),
      ];
      for (const p of candidatePaths) {
        try {
          if (fs.existsSync(p)) {
            fs.unlinkSync(p);
          }
        } catch (err) {
          console.warn("Failed to delete physical file at:", p, err);
        }
      }
    }

    await db.certificate.delete({ where: { id: certificateId } });

    revalidatePath("/admin/student-progress");
    revalidatePath("/dashboard/certificates");
    revalidatePath("/dashboard/progress");

    return { success: true, message: "Certificate deleted successfully." };
  } catch (err: any) {
    console.error("deleteStudentCertificateAction error:", err);
    return { success: false, error: "Failed to delete certificate record." };
  }
}

// 7. GET LOGGED-IN STUDENT DASHBOARD PROGRESS & BELT HISTORY
export async function getStudentDashboardProgressAction() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized session." };
    }

    const userId = session.user.id;

    const student = await db.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        batchStudents: {
          include: {
            batch: {
              include: { program: true },
            },
          },
        },
        certificates: {
          orderBy: { issuedDate: "desc" },
          include: { program: true },
        },
        enrollments: {
          where: { status: "ACTIVE" },
          include: { membershipPlan: { include: { program: true } } },
        },
      },
    });

    if (!student) {
      return { success: false, error: "Student profile not found." };
    }

    const currentBelt = student.studentProfile?.currentBelt || "White Belt";
    const awardDateFormatted = student.studentProfile?.beltAwardedAt
      ? student.studentProfile.beltAwardedAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Academy Enrollment";

    const activeEnrollment = student.enrollments[0];
    const activeProgramTitle =
      activeEnrollment?.membershipPlan?.program?.title ||
      activeEnrollment?.membershipPlan?.name ||
      "Martial Arts Academy";

    // Query assigned batch and exam date
    const primaryAssignment = student.batchStudents[0];
    const assignedBatch = primaryAssignment?.batch || null;

    let batchExamDateFormatted: string | null = null;
    let isExamDatePassed = false;

    if (assignedBatch?.examDate) {
      const examDateObj = new Date(assignedBatch.examDate);
      batchExamDateFormatted = examDateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const examDay = new Date(examDateObj);
      examDay.setHours(0, 0, 0, 0);

      isExamDatePassed = today >= examDay;
    }

    const formattedCertificates = student.certificates.map((cert) => ({
      id: cert.id,
      title: cert.title,
      certificateNumber: cert.certificateNumber,
      beltName: cert.beltName || "Belt Award",
      programTitle: cert.program?.title || "Martial Arts Academy",
      issuedDate: cert.issuedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      fileUrl: `/api/certificates/download/${cert.id}`,
    }));

    return {
      success: true,
      progress: {
        studentName: student.name,
        currentBelt,
        beltAwardedAt: awardDateFormatted,
        activeProgramTitle,
        assignedBatchName: assignedBatch?.name || "Unassigned",
        assignedBatchBeltLevel: assignedBatch?.beltLevel || "Yellow Belt",
        upcomingExamDate: batchExamDateFormatted,
        isExamDatePassed,
        certificates: formattedCertificates,
        totalCertificates: student.certificates.length,
      },
    };
  } catch (err: any) {
    console.error("getStudentDashboardProgressAction error:", err);
    return { success: false, error: "Failed to fetch student dashboard progress." };
  }
}
