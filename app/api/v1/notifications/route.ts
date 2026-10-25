import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileAuth } from "@/lib/mobile-auth";
import {
  ApiResponse,
  MobileNotificationsResponseDto,
  MobileNotificationItemDto,
  NotificationType,
} from "@/types/mobile-api.dto";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/notifications
 * Retrieves notifications and unread badge count for the authenticated student or coach.
 */
export async function GET(
  req: Request
): Promise<NextResponse<ApiResponse<MobileNotificationsResponseDto>>> {
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

    const userId = authResult.user.id;

    // Fetch notifications belonging to this user
    const dbNotifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await db.notification.count({
      where: { userId, isRead: false },
    });

    const formattedNotifications: MobileNotificationItemDto[] = dbNotifications.map(
      (n) => {
        let type: NotificationType = "GENERAL";
        const titleLower = n.title.toLowerCase();

        if (titleLower.includes("reminder") || titleLower.includes("starting in")) {
          type = "CLASS_REMINDER";
        } else if (titleLower.includes("schedule") || titleLower.includes("timing")) {
          type = "SCHEDULE_CHANGE";
        } else if (titleLower.includes("cancel")) {
          type = "CLASS_CANCELLED";
        } else if (titleLower.includes("certificate")) {
          type = "CERTIFICATE_AWARDED";
        } else if (titleLower.includes("enroll") || titleLower.includes("attendance")) {
          type = "ENROLLMENT_UPDATE";
        }

        return {
          id: n.id,
          title: n.title,
          message: n.message,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
          type,
          deepLink:
            type === "CLASS_REMINDER"
              ? "selffits://class/live"
              : "selffits://dashboard/student",
        };
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          notifications: formattedNotifications,
          unreadCount,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/v1/notifications error:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load notifications.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/notifications
 * Marks notifications as read (either by notificationId or mark all as read).
 */
export async function PATCH(
  req: Request
): Promise<NextResponse<ApiResponse<{ updatedCount: number }>>> {
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

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional; empty body marks all as read
    }

    const userId = authResult.user.id;
    const notificationId = body.notificationId;

    if (notificationId && typeof notificationId === "string") {
      const result = await db.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true },
      });
      return NextResponse.json(
        {
          success: true,
          data: { updatedCount: result.count },
        },
        { status: 200 }
      );
    }

    // Mark all unread as read for this user
    const result = await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json(
      {
        success: true,
        data: { updatedCount: result.count },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("PATCH /api/v1/notifications error:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update notification status.",
        },
      },
      { status: 500 }
    );
  }
}
