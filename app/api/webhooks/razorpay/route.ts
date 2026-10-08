import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { PaymentSuccessEmail } from "@/emails/payment-success.email";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "whsec_selffits_razorpay_webhook_secret";

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const eventPayload = JSON.parse(body);
    const event = eventPayload.event;

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = eventPayload.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const amountInSubunits = paymentEntity.amount;
      const currency = paymentEntity.currency;
      const notes = paymentEntity.notes || {};

      const existingPayment = await db.payment.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (existingPayment) {
        if (existingPayment.status !== "SUCCESS") {
          await db.payment.update({
            where: { razorpayOrderId: orderId },
            data: {
              razorpayPaymentId: paymentId,
              status: "SUCCESS",
              rawWebhookPayload: eventPayload,
            },
          });
        }

        // Idempotent coupon usage record in case webhook is processed
        if (existingPayment.couponCode) {
          const couponRecord = await db.coupon.findUnique({
            where: { code: existingPayment.couponCode },
          });

          if (couponRecord) {
            const existingUsage = await db.couponUsage.findUnique({
              where: {
                couponId_orderId: {
                  couponId: couponRecord.id,
                  orderId: orderId,
                },
              },
            });

            if (!existingUsage) {
              await db.$transaction(async (tx) => {
                await tx.couponUsage.create({
                  data: {
                    couponId: couponRecord.id,
                    userId: existingPayment.userId,
                    paymentId: existingPayment.id,
                    orderId: orderId,
                    discountApplied: existingPayment.discountAmount || 0,
                  },
                });

                await tx.coupon.update({
                  where: { id: couponRecord.id },
                  data: {
                    usageCount: { increment: 1 },
                  },
                });
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Razorpay webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
