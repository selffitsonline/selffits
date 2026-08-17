"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateTag, revalidatePath } from "next/cache";
import { z } from "zod";

const LiveLinkSchema = z.object({
  liveClassId: z.string().min(1, "Live class batch ID is required"),
  meetingUrl: z.string().url("Must be a valid URL").refine(
    (url) => url.includes("meet.google.com") || url.includes("zoom.us"),
    { message: "URL must be a valid Google Meet or Zoom link" }
  ),
  platform: z.enum(["GOOGLE_MEET", "ZOOM"]),
  notes: z.string().optional(),
});

export type LiveLinkActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateDailyLiveLinkAction(
  payload: z.infer<typeof LiveLinkSchema>
): Promise<LiveLinkActionResult> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized session." };
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Access Denied: Admin privileges required." };
    }

    const validated = LiveLinkSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: "Invalid link parameters",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const { liveClassId, meetingUrl, platform, notes } = validated.data;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert today's live class link for the selected batch
    await db.liveClassLink.upsert({
      where: {
        liveClassId_validForDate: {
          liveClassId,
          validForDate: today,
        },
      },
      update: {
        meetingUrl,
        platform,
        notes,
        updatedByUserId: session.user.id,
      },
      create: {
        liveClassId,
        meetingUrl,
        platform,
        validForDate: today,
        notes,
        updatedByUserId: session.user.id,
      },
    });

    revalidatePath("/admin/live-links");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/live");

    return {
      success: true,
      message: "Daily live class meeting link published successfully!",
    };
  } catch (err: any) {
    console.error("updateDailyLiveLinkAction error:", err);
    return {
      success: false,
      error: "Failed to update daily live class link.",
    };
  }
}

export async function getTodayLiveClassForStudentAction(programId?: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized session." };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verify active enrollment
    const activeEnrollment = await db.enrollment.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        remainingClasses: { gt: 0 },
        endDate: { gte: new Date() },
      },
    });

    if (!activeEnrollment) {
      return {
        success: false,
        error: "No active membership enrollment found. Please renew your subscription.",
      };
    }

    // Fetch today's live class link
    const liveLink = await db.liveClassLink.findFirst({
      where: {
        validForDate: today,
      },
      include: {
        liveClass: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!liveLink) {
      return {
        success: true,
        link: null,
        message: "Live link will be available 15 minutes before class.",
      };
    }

    return {
      success: true,
      link: {
        id: liveLink.id,
        meetingUrl: liveLink.meetingUrl,
        platform: liveLink.platform,
        batchName: liveLink.liveClass.batchName,
        scheduleDays: liveLink.liveClass.scheduleDays,
        startTime: liveLink.liveClass.startTime,
        endTime: liveLink.liveClass.endTime,
      },
    };
  } catch (err: any) {
    console.error("getTodayLiveClassForStudentAction error:", err);
    return {
      success: false,
      error: "Failed to fetch today's live class link.",
    };
  }
}

export async function logLiveClassAttendanceAction(liveClassId: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized." };
    }

    // Find active enrollment and deduct 1 class credit if remaining > 0
    const activeEnrollment = await db.enrollment.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        remainingClasses: { gt: 0 },
      },
    });

    if (activeEnrollment) {
      const updatedClasses = activeEnrollment.remainingClasses - 1;
      await db.enrollment.update({
        where: { id: activeEnrollment.id },
        data: {
          remainingClasses: updatedClasses,
          status: updatedClasses === 0 ? "COMPLETED" : "ACTIVE",
        },
      });
      revalidatePath("/dashboard");
    }

    return { success: true };
  } catch (err) {
    console.error("logLiveClassAttendanceAction error:", err);
    return { success: false };
  }
}
