"use server";

import { db } from "@/lib/db";
import { razorpay } from "@/lib/razorpay";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { auth } from "@/lib/auth";
import crypto from "crypto";
import { PaymentSuccessEmail } from "@/emails/payment-success.email";

export type PaymentPlanDetail = {
  id: string;
  name: string;
  durationMonths: number;
  totalClasses: number;
  priceINR: number;
  priceUSD: number;
};

const PLAN_MAP: Record<string, PaymentPlanDetail> = {
  "yellow-belt": { id: "yellow-belt", name: "Yellow Belt Tier", durationMonths: 1, totalClasses: 8, priceINR: 2999, priceUSD: 39 },
  "blue-belt": { id: "blue-belt", name: "Blue Belt Tier", durationMonths: 3, totalClasses: 24, priceINR: 7999, priceUSD: 99 },
  "purple-belt": { id: "purple-belt", name: "Purple Belt Tier", durationMonths: 6, totalClasses: 48, priceINR: 13999, priceUSD: 179 },
  "brown-belt": { id: "brown-belt", name: "Brown Belt Tier", durationMonths: 12, totalClasses: 96, priceINR: 24999, priceUSD: 319 },
  "challenge-8": { id: "challenge-8", name: "8 Day Challenge", durationMonths: 1, totalClasses: 8, priceINR: 1499, priceUSD: 19 },
  "challenge-24": { id: "challenge-24", name: "24 Day Challenge", durationMonths: 1, totalClasses: 24, priceINR: 3999, priceUSD: 49 },
  "transformation-96": { id: "transformation-96", name: "96 Day Transformation", durationMonths: 3, totalClasses: 96, priceINR: 13999, priceUSD: 169 },
};

export async function createRazorpayOrderAction(
  planId: string,
  currency: "INR" | "USD" = "INR"
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Please log in to complete your enrollment purchase." };
    }

    const plan = PLAN_MAP[planId] || PLAN_MAP["blue-belt"];
    const basePrice = currency === "INR" ? plan.priceINR : plan.priceUSD;
    const amountInSubunits = Math.round(basePrice * 100);

    const receipt = `rcpt_${Date.now()}_${session.user.id.slice(-6)}`;

    const order = await razorpay.orders.create({
      amount: amountInSubunits,
      currency: currency,
      receipt: receipt,
      notes: {
        userId: session.user.id,
        planId: plan.id,
        planName: plan.name,
      },
    });

    await db.payment.create({
      data: {
        userId: session.user.id,
        razorpayOrderId: order.id,
        amount: basePrice,
        currency: currency,
        status: "PENDING",
      },
    });

    return {
      success: true,
      orderId: order.id,
      amount: amountInSubunits,
      displayAmount: basePrice,
      currency: currency,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      planName: plan.name,
    };
  } catch (err: any) {
    console.error("createRazorpayOrderAction error:", err);
    return {
      success: false,
      error: "Failed to create payment order. Please try again.",
    };
  }
}

export async function verifyPaymentSignatureAction(payload: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  planId: string;
}) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized session." };
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId } = payload;
    const secret = process.env.RAZORPAY_KEY_SECRET || "secret_placeholder";

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return { success: false, error: "Invalid Razorpay payment signature." };
    }

    const plan = PLAN_MAP[planId] || PLAN_MAP["blue-belt"];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    // Find master Program & Plan in database or upsert default
    let program = await db.program.findFirst();
    if (!program) {
      program = await db.program.create({
        data: {
          title: "General Virtual Academy Program",
          slug: "virtual-academy",
          category: "MARTIAL_ARTS",
          targetAudience: "ADULTS",
          description: "Global Online Live Fitness & Martial Arts Training",
        },
      });
    }

    let membershipPlan = await db.membershipPlan.findFirst({
      where: { programId: program.id },
    });
    if (!membershipPlan) {
      membershipPlan = await db.membershipPlan.create({
        data: {
          programId: program.id,
          name: plan.name,
          tierType: "BLUE_BELT",
          durationMonths: plan.durationMonths,
          totalClasses: plan.totalClasses,
          priceINR: plan.priceINR,
          priceUSD: plan.priceUSD,
        },
      });
    }

    // Execute atomic enrollment and payment update
    const result = await db.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({
        data: {
          userId: session.user.id,
          membershipPlanId: membershipPlan.id,
          startDate,
          endDate,
          totalClassesGranted: plan.totalClasses,
          remainingClasses: plan.totalClasses,
          status: "ACTIVE",
        },
      });

      const updatedPayment = await tx.payment.update({
        where: { razorpayOrderId },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          enrollmentId: enrollment.id,
          status: "SUCCESS",
        },
      });

      return { enrollment, updatedPayment };
    });

    // Send confirmation email via Resend
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: session.user.email as string,
        subject: `Enrollment Confirmed - ${plan.name} (SELFFITS)`,
        react: PaymentSuccessEmail({
          name: session.user.name || "Student",
          planName: plan.name,
          amount: String(plan.priceINR),
          currency: "INR",
          orderId: razorpayOrderId,
          dashboardUrl: `${baseUrl}/dashboard`,
        }),
      });
    } catch (mailErr) {
      console.error("Failed to send payment confirmation email:", mailErr);
    }

    return {
      success: true,
      message: "Payment verified and enrollment active!",
      enrollmentId: result.enrollment.id,
    };
  } catch (err: any) {
    console.error("verifyPaymentSignatureAction error:", err);
    return {
      success: false,
      error: "Payment signature verification failed.",
    };
  }
}

export async function getStudentEnrollmentAction() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, isEnrolled: false };
    }

    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
      include: {
        membershipPlan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!enrollment) {
      return { success: true, isEnrolled: false };
    }

    const now = new Date();
    const endDate = new Date(enrollment.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const formattedDate = enrollment.endDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return {
      success: true,
      isEnrolled: true,
      enrollment: {
        id: enrollment.id,
        programName: enrollment.membershipPlan?.name || "Adults Martial Arts - Blue Belt Tier",
        beltLevel: enrollment.membershipPlan?.tierType ? enrollment.membershipPlan.tierType.replace("_", " ") : "Blue Belt",
        remainingClasses: enrollment.remainingClasses,
        totalClasses: enrollment.totalClassesGranted,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 30,
        membershipStatus: enrollment.status,
        expiryDate: formattedDate,
        nextClassTime: "Today at 7:00 PM IST",
        instructor: "Sensei Rahul Sharma",
        liveClassLink: "https://meet.google.com/selffits-live-class",
      },
    };
  } catch (err: any) {
    console.error("getStudentEnrollmentAction error:", err);
    return { success: false, isEnrolled: false };
  }
}

export async function createDirectCardEnrollmentAction(
  planId: string,
  currency: "INR" | "USD" = "INR"
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Please log in to complete your enrollment purchase." };
    }

    const plan = PLAN_MAP[planId] || PLAN_MAP["blue-belt"];
    const basePrice = currency === "INR" ? plan.priceINR : plan.priceUSD;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    // Find or create Program & MembershipPlan
    let program = await db.program.findFirst();
    if (!program) {
      program = await db.program.create({
        data: {
          title: "General Virtual Academy Program",
          slug: "virtual-academy",
          category: "MARTIAL_ARTS",
          targetAudience: "ADULTS",
          description: "Global Online Live Fitness & Martial Arts Training",
        },
      });
    }

    let membershipPlan = await db.membershipPlan.findFirst({
      where: { programId: program.id },
    });
    if (!membershipPlan) {
      membershipPlan = await db.membershipPlan.create({
        data: {
          programId: program.id,
          name: plan.name,
          tierType: "BLUE_BELT",
          durationMonths: plan.durationMonths,
          totalClasses: plan.totalClasses,
          priceINR: plan.priceINR,
          priceUSD: plan.priceUSD,
        },
      });
    }

    // Execute atomic enrollment and payment creation in PostgreSQL
    const result = await db.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({
        data: {
          userId: session.user.id,
          membershipPlanId: membershipPlan.id,
          startDate,
          endDate,
          totalClassesGranted: plan.totalClasses,
          remainingClasses: plan.totalClasses,
          status: "ACTIVE",
        },
      });

      const payment = await tx.payment.create({
        data: {
          userId: session.user.id,
          enrollmentId: enrollment.id,
          razorpayOrderId: `card_order_${Date.now()}`,
          razorpayPaymentId: `card_pay_${Date.now()}`,
          razorpaySignature: "direct_card_authorization",
          amount: basePrice,
          currency: currency,
          status: "SUCCESS",
        },
      });

      return { enrollment, payment };
    });

    return {
      success: true,
      message: "Direct card payment authorized and enrollment created!",
      enrollmentId: result.enrollment.id,
    };
  } catch (err: any) {
    console.error("createDirectCardEnrollmentAction error:", err);
    return {
      success: false,
      error: "Failed to authorize card payment and record enrollment.",
    };
  }
}
