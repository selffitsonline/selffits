import { db } from "@/lib/db";
import { pushNotificationService } from "@/lib/push-notification-service";

export interface PaymentSuccessNotificationParams {
  userId: string;
  orderId: string;
  planName?: string;
  enrollmentId?: string;
  amount?: number | string;
  currency?: string;
}

export interface PaymentFailureNotificationParams {
  userId: string;
  orderId: string;
  reason?: string;
}

export interface NotificationDispatchResult {
  inAppCreated: boolean;
  pushDispatched: boolean;
  deduplicated: boolean;
}

/**
 * Dispatches an in-app and FCM push notification for confirmed payments and program enrollments.
 *
 * Idempotency Guarantees:
 * 1. Database-level check: Checks whether an authentic `db.notification` record matching
 *    the student's `userId`, title "Enrollment Confirmed! 🥋", and order ID already exists.
 * 2. Push-level deduplication: Employs a deterministic deduplicationKey (`payment_success:${orderId}`)
 *    via `pushNotificationService` to prevent repeat FCM dispatches.
 * 3. Fail-open error isolation: Any push transport failure or exception is logged as a warning
 *    and does not reverse the completed payment or throw an unhandled error.
 */
export async function dispatchPaymentSuccessNotification(
  params: PaymentSuccessNotificationParams
): Promise<NotificationDispatchResult> {
  const { userId, orderId, planName = "Online Training Membership", enrollmentId } = params;

  // 1. Authoritative Database-Level Idempotency Check
  // Prevents dual in-app records when client verification and Razorpay webhook process the same order.
  const existingSuccessNotification = await db.notification.findFirst({
    where: {
      userId,
      title: "Enrollment Confirmed! 🥋",
      message: { contains: orderId },
    },
  });

  let inAppCreated = false;
  if (!existingSuccessNotification) {
    await db.notification.create({
      data: {
        userId,
        title: "Enrollment Confirmed! 🥋",
        message: `Your enrollment for ${planName} (Order: ${orderId}) has been confirmed! Welcome to SELFFITS!`,
      },
    });
    inAppCreated = true;
  }

  // 2. FCM Push Notification Dispatch
  let pushDispatched = false;
  let deduplicated = false;

  try {
    const pushResult = await pushNotificationService.sendToUser(
      userId,
      {
        title: "Enrollment Confirmed! 🥋",
        body: `Your enrollment for ${planName} (Order: ${orderId}) has been confirmed! Welcome to SELFFITS!`,
        data: {
          type: "ENROLLMENT_UPDATE",
          deepLink: "selffits://dashboard/student",
          orderId,
          ...(enrollmentId ? { enrollmentId } : {}),
        },
      },
      {
        persistInApp: false, // In-app notification already managed above
        deduplicationKey: `payment_success:${orderId}`,
      }
    );

    deduplicated = Boolean(pushResult.deduplicated);
    pushDispatched = pushResult.success && !deduplicated;
  } catch (pushErr) {
    console.warn(`Failed to dispatch enrollment push notification for order ${orderId}:`, pushErr);
  }

  return { inAppCreated, pushDispatched, deduplicated };
}

/**
 * Dispatches an in-app and FCM push notification for failed payments.
 */
export async function dispatchPaymentFailureNotification(
  params: PaymentFailureNotificationParams
): Promise<NotificationDispatchResult> {
  const { userId, orderId, reason } = params;

  // 1. Authoritative Database-Level Idempotency Check
  const existingFailureNotification = await db.notification.findFirst({
    where: {
      userId,
      title: "Payment Failed ⚠️",
      message: { contains: orderId },
    },
  });

  let inAppCreated = false;
  if (!existingFailureNotification) {
    const failureMsg = reason
      ? `Payment for order ${orderId} could not be processed: ${reason}. Please check your payment details or try again.`
      : `Payment for order ${orderId} could not be processed. Please check your payment details or try again.`;

    await db.notification.create({
      data: {
        userId,
        title: "Payment Failed ⚠️",
        message: failureMsg,
      },
    });
    inAppCreated = true;
  }

  // 2. FCM Push Notification Dispatch
  let pushDispatched = false;
  let deduplicated = false;

  try {
    const pushResult = await pushNotificationService.sendToUser(
      userId,
      {
        title: "Payment Failed ⚠️",
        body: `Payment for order ${orderId} could not be processed. Please check your payment details or try again.`,
        data: {
          type: "GENERAL",
          deepLink: "selffits://dashboard/student",
          orderId,
        },
      },
      {
        persistInApp: false,
        deduplicationKey: `payment_failed:${orderId}`,
      }
    );

    deduplicated = Boolean(pushResult.deduplicated);
    pushDispatched = pushResult.success && !deduplicated;
  } catch (pushErr) {
    console.warn(`Failed to dispatch payment failure push notification for order ${orderId}:`, pushErr);
  }

  return { inAppCreated, pushDispatched, deduplicated };
}

