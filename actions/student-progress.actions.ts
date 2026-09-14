"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ExaminationStatus } from "@prisma/client";
import fs from "fs";
import path from "path";

// 1. GET ADMIN STUDENT PROGRESS LIST (Central directory of students with belt & exam status)
export async function getAdminStudentProgressListAction() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access to Admin portal." };
    }

    // Fetch active batches for Batch selection dropdown
    const batches = await db.batch.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        program: true,
        coach: true,
        students: { select: { userId: true } },
      },
    });

    const formattedBatches = batches.map((b) => ({
      id: b.id,
      batchId: b.batchId,
      name: b.name,
      programTitle: b.program.title,
      programCategory: b.program.category,
      beltLevel: b.beltLevel || "Yellow Belt",
      coachName: b.coach.fullName,
      coachRank: b.coach.highestRank || "Certified Coach",
      dayCombination: b.dayCombination,
      timeSlot: b.timeSlot,
      clockTiming: b.clockTiming,
      examDate: b.examDate
        ? b.examDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : null,
      examDateISO: b.examDate ? b.examDate.toISOString().split("T")[0] : null,
      maxCapacity: b.maxCapacity || 8,
      studentCount: b.students.length,
      capacityLabel: `${b.students.length} / ${b.maxCapacity || 8}`,
      status: b.status,
    }));

    const students = await db.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      include: {
        studentProfile: true,
        batchStudents: {
          include: {
            batch: {
              include: { program: true },
            },
          },
        },
        examinations: {
          orderBy: { examDate: "desc" },
          include: { program: true },
        },
        beltProgressions: {
          orderBy: { awardDate: "desc" },
          include: { certificate: true, examination: true },
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

    const formattedStudents = students.map((std) => {
      const activeEnrollment = std.enrollments[0];
      const activeProgramTitle =
        activeEnrollment?.membershipPlan?.program?.title ||
        activeEnrollment?.membershipPlan?.name ||
        "General Martial Arts";

      const latestExam = std.examinations[0];
      const currentBelt = std.studentProfile?.currentBelt || "White Belt";

      const awardDateFormatted = std.studentProfile?.beltAwardedAt
        ? std.studentProfile.beltAwardedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Initial Assignment";

      const batchIds = std.batchStudents.map((bs) => bs.batchId);
      const batchNames = std.batchStudents.map((bs) => bs.batch.name);

      return {
        id: std.id,
        name: std.name,
        email: std.email,
        phone: std.studentProfile?.phone || "Not provided",
        joinedDate: std.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        createdAtISO: std.createdAt.toISOString(),
        currentBelt,
        beltAwardedAt: awardDateFormatted,
        activeProgram: activeProgramTitle,
        batchIds,
        batchNames,
        totalExams: std.examinations.length,
        latestExamStatus: latestExam ? latestExam.status : "NO_EXAM",
        latestExamDate: latestExam
          ? latestExam.examDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : null,
        latestExamDateISO: latestExam ? latestExam.examDate.toISOString() : null,
        totalProgressions: std.beltProgressions.length,
        totalCertificates: std.certificates.length,
      };
    });

    return { success: true, batches: formattedBatches, students: formattedStudents };
  } catch (err: any) {
    console.error("getAdminStudentProgressListAction error:", err);
    return { success: false, error: "Failed to fetch student progress list." };
  }
}

// 2. GET SINGLE STUDENT PROGRESS DETAILS FOR ADMIN VIEW
export async function getStudentProgressDetailsAction(studentId: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized session." };
    }

    // RBAC Guard: Student can only view own record unless Admin
    if (session.user.role === "STUDENT" && session.user.id !== studentId) {
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
    const activeEnrollment = student.enrollments.find((e) => e.status === "ACTIVE");
    const activeProgram = activeEnrollment?.membershipPlan?.program;

    // Get primary assigned batch and exam date
    const primaryBatchAssignment = student.batchStudents[0];
    const assignedBatch = primaryBatchAssignment?.batch || null;

    let batchExamDateFormatted: string | null = null;
    let batchExamDateISO: string | null = null;
    let isExamDatePassed = false;
    let examStatusLabel = "NO_EXAM_DATE";

    if (assignedBatch?.examDate) {
      const examDateObj = new Date(assignedBatch.examDate);
      batchExamDateFormatted = examDateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      batchExamDateISO = examDateObj.toISOString().split("T")[0];

      // Exam Date Status comparison (Compare year/month/day at midnight)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const examDay = new Date(examDateObj);
      examDay.setHours(0, 0, 0, 0);

      if (today >= examDay) {
        isExamDatePassed = true;
        examStatusLabel = "EXAM_DATE_PASSED";
      } else {
        isExamDatePassed = false;
        examStatusLabel = "UPCOMING_EXAM";
      }
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
      fileKey: cert.fileKey,
      fileUrl: `/api/certificates/download/${cert.id}`,
    }));

    return {
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.studentProfile?.phone || "Not provided",
        currentBelt,
        beltAwardedAt: student.studentProfile?.beltAwardedAt
          ? student.studentProfile.beltAwardedAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Initial Assignment",
        activeProgramTitle: activeProgram?.title || assignedBatch?.program?.title || "Martial Arts Program",
        activeProgramId: activeProgram?.id || assignedBatch?.programId || null,
        batchInfo: assignedBatch
          ? {
              id: assignedBatch.id,
              batchId: assignedBatch.batchId,
              name: assignedBatch.name,
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
    return { success: false, error: "Failed to fetch student progress details." };
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
