import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateNextClassSession } from "@/lib/class-schedule";
import { pushNotificationService } from "@/lib/push-notification-service";
import { ApiResponse, ClassReminderCronResponseDto } from "@/types/mobile-api.dto";

export const dynamic = "force-dynamic";

/**
 * Helper to parse timing string into UTC minutes-until-start.
 * Clock timing format: e.g. "05:15 PM to 06:00 PM (GMT)"
 */
function getMinutesUntilClassStart(clockTiming: string, referenceDate: Date = new Date()): number | null {
  try {
    const timeMatch = clockTiming.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) return null;

    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const modifier = timeMatch[3].toUpperCase();

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    // Class timing is defined in GMT (UTC)
    const classStartUtc = new Date(referenceDate);
    classStartUtc.setUTCHours(hours, minutes, 0, 0);

    const diffMs = classStartUtc.getTime() - referenceDate.getTime();
    return Math.floor(diffMs / (60 * 1000));
  } catch {
    return null;
  }
}

/**
 * GET or POST /api/v1/cron/class-reminders
 * Server-side cron job triggering 15-minute class reminders.
 * Secured by CRON_SECRET environment variable.
 */
async function handleClassRemindersCron(req: Request): Promise<NextResponse<ApiResponse<ClassReminderCronResponseDto>>> {
  const cronSecret = process.env.CRON_SECRET;

  // Enforce CRON_SECRET authorization if configured
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    const customHeader = req.headers.get("x-cron-secret");
    const providedSecret =
      customHeader || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

    if (providedSecret !== cronSecret) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED_CRON",
            message: "Invalid or missing cron authentication secret.",
          },
        },
        { status: 401 }
      );
    }
  }

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const errors: string[] = [];
  let remindersDispatched = 0;

  try {
    // 1. Fetch all active and full batches
    const batches = await db.batch.findMany({
      where: {
        status: { in: ["ACTIVE", "FULL"] },
      },
      include: {
        program: { select: { title: true } },
        coach: { select: { id: true, fullName: true, email: true } },
        students: {
          select: {
            userId: true,
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
    });

    for (const batch of batches) {
      try {
        const schedule = calculateNextClassSession(
          batch.dayCombination,
          batch.clockTiming,
          batch.timeSlot,
          now
        );

        // Only process sessions scheduled for today
        if (!schedule.isToday) {
          continue;
        }

        const minutesUntilStart = getMinutesUntilClassStart(batch.clockTiming, now);

        // Target window: class starting between 0 and 15 minutes from now
        if (minutesUntilStart !== null && minutesUntilStart >= 0 && minutesUntilStart <= 15) {
          const studentUserIds = batch.students.map((s) => s.userId);
          const targetUserIds: string[] = [...studentUserIds];

          // If coach has a corresponding User account, also remind coach
          if (batch.coach) {
            const coachUser = await db.user.findFirst({
              where: { email: { equals: batch.coach.email, mode: "insensitive" } },
              select: { id: true },
            });
            if (coachUser) {
              targetUserIds.push(coachUser.id);
            }
          }

          if (targetUserIds.length > 0) {
            const coachDisplayName = batch.coach?.fullName || "Sensei";
            const result = await pushNotificationService.sendClassReminder({
              batchId: batch.id,
              batchName: `${batch.program.title} (${batch.name})`,
              coachName: coachDisplayName,
              meetingUrl: batch.meetingUrl,
              startTimeStr: batch.clockTiming,
              userIds: targetUserIds,
              dateStr,
            });

            if (result.success && !result.deduplicated) {
              remindersDispatched++;
            }
          }
        }
      } catch (batchErr: any) {
        errors.push(`Batch ${batch.id} reminder error: ${batchErr.message}`);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          success: true,
          timestamp: now.toISOString(),
          batchesScanned: batches.length,
          remindersDispatched,
          errors: errors.length > 0 ? errors : undefined,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Cron class reminders error:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to execute class reminders cron.",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return handleClassRemindersCron(req);
}

export async function POST(req: Request) {
  return handleClassRemindersCron(req);
}
