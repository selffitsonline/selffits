"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getStudentNotificationsAction() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized session." };
    }

    const notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, notifications };
  } catch (err: any) {
    console.error("getStudentNotificationsAction error:", err);
    return { success: false, error: "Failed to fetch notifications." };
  }
}

export async function markNotificationReadAction(notificationId: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized." };
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (err) {
    console.error("markNotificationReadAction error:", err);
    return { success: false };
  }
}
