"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { calculateNextClassSession, NextClassSession } from "@/lib/class-schedule";

export interface CoachBatchStudent {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  assignedAt: string;
  martialArtsType?: string | null;
}

export interface CoachBatchInfo {
  id: string;
  batchId: string;
  name: string;
  programTitle: string;
  programCategory: string;
  beltLevel: string;
  dayCombination: string;
  timeSlot: string;
  clockTiming: string;
  meetingUrl: string | null;
  status: string;
  maxCapacity: number;
  studentsCount: number;
  students: CoachBatchStudent[];
  isMeetingActive: boolean;
  nextSession: NextClassSession;
}

export interface CoachDashboardData {
  coach: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    highestRank: string;
    disciplines: string[];
    status: string;
    profilePhotoUrl?: string | null;
  };
  upcomingClass: CoachBatchInfo | null;
  batches: CoachBatchInfo[];
  totalBatchesCount: number;
  totalStudentsCount: number;
}

/**
 * Get Coach Dashboard Data including the upcoming class and assigned batches.
 * Uses the exact same Batch database records and meetingUrl as the Student Dashboard.
 */
export async function getCoachDashboardDataAction(): Promise<{
  success: boolean;
  error?: string;
  data?: CoachDashboardData;
}> {
  try {
    let session = null;
    try {
      session = await auth();
    } catch {
      session = null;
    }

    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "Please log in to access the Coach Dashboard." };
    }

    // Live database re-verification
    const liveUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBlocked: true,
      },
    });

    if (!liveUser) {
      return { success: false, error: "User account no longer exists." };
    }

    if (liveUser.isBlocked) {
      return { success: false, error: "Your account has been blocked by an administrator." };
    }

    // Strict role authorization: Only COACH, ADMIN, or SUPER_ADMIN
    if (
      liveUser.role !== Role.COACH &&
      liveUser.role !== Role.ADMIN &&
      liveUser.role !== Role.SUPER_ADMIN
    ) {
      return { success: false, error: "Access denied. Coach privileges required." };
    }

    const userEmail = liveUser.email.toLowerCase().trim();
    const userRole = liveUser.role;

    // Find CoachApplication by user email or check if admin is previewing
    let coach = null;

    if (userEmail) {
      coach = await db.coachApplication.findFirst({
        where: {
          email: { equals: userEmail, mode: "insensitive" },
        },
      });
    }

    // If logged in as admin / super_admin and no coach with that email, allow previewing the first active coach
    if (!coach && (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN)) {
      coach = await db.coachApplication.findFirst({
        where: {
          batches: { some: {} }, // Coach with assigned batches
        },
      });

      if (!coach) {
        coach = await db.coachApplication.findFirst();
      }
    }

    if (!coach) {
      return {
        success: false,
        error: "No Coach profile found matching your account. Please contact academy support.",
      };
    }

    // Enforce suspension and deactivation check
    if (coach.status === "SUSPENDED" || coach.status === "REJECTED") {
      return {
        success: false,
        error: "Your coach profile has been suspended or deactivated by an administrator.",
      };
    }

    // Fetch all batches assigned to this coach
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

    const formattedBatches: CoachBatchInfo[] = batches.map((b) => {
      const isMeetingActive = !!(b.meetingUrl && b.meetingUrl.trim() !== "" && b.status !== "INACTIVE");
      const nextSession = calculateNextClassSession(b.dayCombination, b.clockTiming, b.timeSlot);

      const studentsList: CoachBatchStudent[] = b.students.map((bs) => {
        uniqueStudentIds.add(bs.user.id);
        const activeEnr = (bs.user as any).enrollments?.[0];
        return {
          id: bs.user.id,
          name: bs.user.name,
          email: bs.user.email,
          image: bs.user.image,
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
        programCategory: b.program.category,
        beltLevel: b.beltLevel,
        dayCombination: b.dayCombination,
        timeSlot: b.timeSlot,
        clockTiming: b.clockTiming,
        meetingUrl: b.meetingUrl || null,
        status: b.status,
        maxCapacity: b.maxCapacity,
        studentsCount: b.students.length,
        students: studentsList,
        isMeetingActive,
        nextSession,
      };
    });

    // Identify primary Upcoming Class:
    // Active batches sorted by earliest upcoming session (today first, then tomorrow, etc.)
    const activeBatches = formattedBatches.filter((b) => b.status === "ACTIVE" || b.status === "FULL");
    
    // Sort so batches with "isToday" come first
    activeBatches.sort((a, b) => {
      if (a.nextSession.isToday && !b.nextSession.isToday) return -1;
      if (!a.nextSession.isToday && b.nextSession.isToday) return 1;
      return 0;
    });

    const upcomingClass = activeBatches.length > 0 ? activeBatches[0] : formattedBatches[0] || null;

    return {
      success: true,
      data: {
        coach: {
          id: coach.id,
          fullName: coach.fullName,
          email: coach.email,
          phone: coach.phone,
          highestRank: coach.highestRank || "Certified Instructor",
          disciplines: parsedDisciplines,
          status: coach.status,
          profilePhotoUrl: coach.profilePhotoUrl,
        },
        upcomingClass,
        batches: formattedBatches,
        totalBatchesCount: formattedBatches.length,
        totalStudentsCount: uniqueStudentIds.size,
      },
    };
  } catch (err: any) {
    console.error("getCoachDashboardDataAction error:", err);
    return { success: false, error: "Failed to load coach dashboard data." };
  }
}
