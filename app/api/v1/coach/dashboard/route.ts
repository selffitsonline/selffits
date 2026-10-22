import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyMobileAuth, enforceMobileRole } from "@/lib/mobile-auth";
import { calculateNextClassSession } from "@/lib/class-schedule";
import {
  ApiResponse,
  CoachDashboardResponseDto,
  CoachBatchSummaryDto,
  CoachStudentSummaryDto,
} from "@/types/mobile-api.dto";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request
): Promise<NextResponse<ApiResponse<CoachDashboardResponseDto>>> {
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
        name: liveUser.name || "Coach",
        email: liveUser.email || "",
        role: liveUser.role,
        isBlocked: liveUser.isBlocked,
      },
      [Role.COACH, Role.ADMIN, Role.SUPER_ADMIN]
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

    const userEmail = liveUser.email.toLowerCase().trim();
    const userRole = liveUser.role;

    // 3. Resolve CoachApplication by email (consistent with website actions/coach.actions.ts:76)
    let coach = await db.coachApplication.findFirst({
      where: {
        email: { equals: userEmail, mode: "insensitive" },
      },
    });

    // If admin is previewing without a direct coach application, preview the first active coach
    if (!coach && (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN)) {
      coach = await db.coachApplication.findFirst({
        where: {
          batches: { some: {} },
        },
      });

      if (!coach) {
        coach = await db.coachApplication.findFirst();
      }
    }

    if (!coach) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "COACH_PROFILE_NOT_FOUND",
            message: "No Coach profile found matching your account. Please contact academy support.",
          },
        },
        { status: 404 }
      );
    }

    // 4. Reject suspended or rejected coach profiles
    if (coach.status === "SUSPENDED" || coach.status === "REJECTED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "COACH_ACCOUNT_SUSPENDED",
            message: "Your coach profile has been suspended or deactivated by an administrator.",
          },
        },
        { status: 403 }
      );
    }

    // 5. Fetch batches strictly assigned to this coach (Strict Coach Isolation)
    const batches = await db.batch.findMany({
      where: {
        coachId: coach.id,
      },
      include: {
        program: true,
        membershipPlan: true,
        students: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                enrollments: {
                  where: { status: "ACTIVE" },
                  orderBy: { createdAt: "desc" },
                  take: 1,
                  select: {
                    martialArtsType: true,
                  },
                },
              },
            },
          },
          orderBy: { assignedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const parsedDisciplines = Array.isArray(coach.disciplines)
      ? (coach.disciplines as string[])
      : typeof coach.disciplines === "string"
      ? [coach.disciplines]
      : [];

    const uniqueStudentIds = new Set<string>();

    const formattedBatches: CoachBatchSummaryDto[] = batches.map((b) => {
      const isMeetingActive = !!(
        b.meetingUrl &&
        b.meetingUrl.trim() !== "" &&
        b.status !== "INACTIVE"
      );
      const nextSession = calculateNextClassSession(
        b.dayCombination,
        b.clockTiming,
        b.timeSlot
      );

      const studentsList: CoachStudentSummaryDto[] = b.students.map((bs) => {
        uniqueStudentIds.add(bs.user.id);
        const activeEnr = (bs.user as any).enrollments?.[0];
        return {
          id: bs.user.id,
          name: bs.user.name,
          email: bs.user.email,
          image: bs.user.image || null,
          martialArtsType: activeEnr?.martialArtsType || null,
          assignedAt: bs.assignedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        };
      });

      return {
        id: b.id,
        batchId: b.batchId,
        name: b.name,
        programTitle: b.program.title,
        beltLevel: b.beltLevel,
        dayCombination: b.dayCombination,
        timeSlot: b.timeSlot,
        clockTiming: b.clockTiming,
        meetingUrl: b.meetingUrl || null,
        isMeetingActive,
        status: b.status,
        maxCapacity: b.maxCapacity,
        studentsCount: b.students.length,
        students: studentsList,
        nextSession: {
          nextClassDay: nextSession.nextClassDay,
          nextClassDate: nextSession.nextClassDate,
          nextClassFullDate: nextSession.nextClassFullDate,
          relativeLabel: nextSession.relativeLabel,
          isToday: nextSession.isToday,
          clockTiming: nextSession.clockTiming,
          timeSlot: nextSession.timeSlot,
          dayCombination: nextSession.dayCombination,
        },
      };
    });

    // 6. Identify primary upcoming class (today sessions first, matching actions/coach.actions.ts:187-200)
    const activeBatches = formattedBatches.filter(
      (b) => b.status === "ACTIVE" || b.status === "FULL"
    );

    activeBatches.sort((a, b) => {
      if (a.nextSession.isToday && !b.nextSession.isToday) return -1;
      if (!a.nextSession.isToday && b.nextSession.isToday) return 1;
      return 0;
    });

    const upcomingClass =
      activeBatches.length > 0 ? activeBatches[0] : formattedBatches[0] || null;

    return NextResponse.json(
      {
        success: true,
        data: {
          coach: {
            id: coach.id,
            fullName: coach.fullName,
            email: coach.email,
            highestRank: coach.highestRank || "Certified Instructor",
            disciplines: parsedDisciplines,
            profilePhotoUrl: coach.profilePhotoUrl || null,
          },
          totalBatchesCount: formattedBatches.length,
          totalStudentsCount: uniqueStudentIds.size,
          upcomingClass,
          batches: formattedBatches,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Mobile API Coach Dashboard Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load coach dashboard.",
        },
      },
      { status: 500 }
    );
  }
}
