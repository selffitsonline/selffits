import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyMobileAuth, enforceMobileRole } from "@/lib/mobile-auth";
import { getCentralClassReadinessForUser } from "@/actions/batch.actions";
import {
  ApiResponse,
  StudentDashboardResponseDto,
  StudentActiveEnrollmentSummaryDto,
} from "@/types/mobile-api.dto";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request
): Promise<NextResponse<ApiResponse<StudentDashboardResponseDto>>> {
  try {
    const authResult = await verifyMobileAuth(req);

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: authResult.errorCode,
            message: authResult.message,
          },
        },
        { status: authResult.statusCode }
      );
    }

    // 1. Live database re-verification: enforce immediate revocation if account is blocked or deleted
    let liveUser = await db.user.findUnique({
      where: { id: authResult.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
      },
    });

    if (!liveUser && authResult.user.email) {
      liveUser = await db.user.findUnique({
        where: { email: authResult.user.email.toLowerCase().trim() },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isBlocked: true,
        },
      });
    }

    if (!liveUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User account no longer exists.",
          },
        },
        { status: 401 }
      );
    }

    if (liveUser.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACCOUNT_BLOCKED",
            message: "Your account has been suspended by an administrator.",
          },
        },
        { status: 403 }
      );
    }

    // 2. Role check using live database role
    const roleCheck = enforceMobileRole(
      {
        id: liveUser.id,
        name: liveUser.name || "Student",
        email: liveUser.email || "",
        role: liveUser.role,
        isBlocked: liveUser.isBlocked,
      },
      [Role.STUDENT, Role.ADMIN, Role.SUPER_ADMIN]
    );

    if (!roleCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: roleCheck.errorResponse!.errorCode,
            message: roleCheck.errorResponse!.message,
          },
        },
        { status: roleCheck.errorResponse!.statusCode }
      );
    }

    const userId = liveUser.id;

    // 3. Fetch centralized class readiness & Google Meet link
    let readiness;
    try {
      readiness = await getCentralClassReadinessForUser(userId);
    } catch (readinessErr) {
      console.warn("Class readiness lookup warning:", readinessErr);
      readiness = {
        hasBatch: false,
        isReady: false,
        batchId: null,
        batchCode: null,
        batchName: null,
        programTitle: null,
        levelName: null,
        coachName: null,
        coachRank: null,
        dayCombination: null,
        timeSlot: null,
        clockTiming: null,
        meetingUrl: null,
        capacityLabel: null,
        batchStatus: null,
        nextSession: {
          nextClassDay: "TBD",
          nextClassDate: "Upcoming",
          nextClassFullDate: "Upcoming Session",
          relativeLabel: "Upcoming",
          isToday: false,
          clockTiming: "05:00 PM to 06:00 PM (GMT)",
          timeSlot: "Evening",
          dayCombination: "Weekly Schedule",
        },
      };
    }

    // 4. Fetch all enrollment details for student
    let activeEnrollmentSummary: StudentActiveEnrollmentSummaryDto | null = null;
    let allEnrollmentsSummary: StudentActiveEnrollmentSummaryDto[] = [];
    let isEnrolled = false;
    let meetingUrl: string | null = null;
    let isReady = false;

    try {
      const now = new Date();
      const allDbEnrollments = await db.enrollment.findMany({
        where: {
          userId,
        },
        include: {
          membershipPlan: {
            include: {
              program: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const activeEnrollment = allDbEnrollments.find(
        (e) => e.status === "ACTIVE" && new Date(e.endDate) > now && e.remainingClasses > 0
      );

      if (activeEnrollment) {
        isEnrolled = true;
      }

      // Strict Security Guard: Un-enrolled, expired, or exhausted students must never receive Google Meet access
      meetingUrl = isEnrolled ? readiness.meetingUrl : null;
      isReady = isEnrolled ? readiness.isReady : false;

      allEnrollmentsSummary = allDbEnrollments.map((enrollment) => {
        const diffTime = new Date(enrollment.endDate).getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const isThisEnrollmentActive =
          enrollment.status === "ACTIVE" &&
          new Date(enrollment.endDate) > now &&
          enrollment.remainingClasses > 0;

        return {
          id: enrollment.id,
          programTitle:
            enrollment.membershipPlan?.program?.title ||
            enrollment.membershipPlan?.name ||
            "Martial Arts Academy",
          tierName: enrollment.membershipPlan?.name || null,
          remainingClasses: enrollment.remainingClasses,
          totalClasses: enrollment.totalClassesGranted,
          expiryDate: enrollment.endDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          daysRemaining,
          martialArtsType: enrollment.martialArtsType || null,
          includeDietNutrition: !!enrollment.includeDietNutrition,
          status: enrollment.status,
          isReady: isThisEnrollmentActive ? isReady : false,
          meetingUrl: isThisEnrollmentActive ? meetingUrl : null,
        };
      });

      if (activeEnrollment) {
        const diffTime = new Date(activeEnrollment.endDate).getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        activeEnrollmentSummary = {
          id: activeEnrollment.id,
          programTitle:
            activeEnrollment.membershipPlan?.program?.title ||
            activeEnrollment.membershipPlan?.name ||
            "Martial Arts Academy",
          tierName: activeEnrollment.membershipPlan?.name || null,
          remainingClasses: activeEnrollment.remainingClasses,
          totalClasses: activeEnrollment.totalClassesGranted,
          expiryDate: activeEnrollment.endDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          daysRemaining,
          martialArtsType: activeEnrollment.martialArtsType || null,
          includeDietNutrition: !!activeEnrollment.includeDietNutrition,
          status: activeEnrollment.status,
          isReady: isReady,
          meetingUrl: meetingUrl,
        };
      } else if (allEnrollmentsSummary.length > 0) {
        activeEnrollmentSummary = allEnrollmentsSummary[0];
      }
    } catch (enrErr) {
      console.warn("Enrollment lookup warning:", enrErr);
    }

    // 5. Count unread notifications
    let unreadCount = 0;
    try {
      unreadCount = await db.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });
    } catch {
      unreadCount = 0;
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: liveUser.id,
            name: liveUser.name || "Student",
            email: liveUser.email || "",
            role: liveUser.role,
            isBlocked: liveUser.isBlocked,
          },
          isEnrolled,
          enrollment: activeEnrollmentSummary,
          enrollments: allEnrollmentsSummary,
          classReadiness: {
            hasBatch: readiness.hasBatch,
            isReady,
            batchId: readiness.batchId,
            batchCode: readiness.batchCode,
            batchName: readiness.batchName,
            programTitle: readiness.programTitle,
            levelName: readiness.levelName,
            coachName: readiness.coachName,
            coachRank: readiness.coachRank,
            dayCombination: readiness.dayCombination,
            timeSlot: readiness.timeSlot,
            clockTiming: readiness.clockTiming,
            meetingUrl,
            capacityLabel: readiness.capacityLabel,
            batchStatus: readiness.batchStatus,
            nextSession: {
              nextClassDay: readiness.nextSession?.nextClassDay || "Upcoming",
              nextClassDate: readiness.nextSession?.nextClassDate || "",
              nextClassFullDate: readiness.nextSession?.nextClassFullDate || "Upcoming Session",
              relativeLabel: readiness.nextSession?.relativeLabel || "Upcoming",
              isToday: !!readiness.nextSession?.isToday,
              clockTiming: readiness.nextSession?.clockTiming || "05:00 PM to 06:00 PM (GMT)",
              timeSlot: readiness.nextSession?.timeSlot || "Evening",
              dayCombination: readiness.nextSession?.dayCombination || "Weekly Schedule",
            },
          },
          unreadNotificationsCount: unreadCount,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Mobile API Student Dashboard Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load student dashboard.",
        },
      },
      { status: 500 }
    );
  }
}
