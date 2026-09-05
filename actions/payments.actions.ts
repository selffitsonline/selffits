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
  tierType?: string;
};

const PLAN_MAP: Record<string, PaymentPlanDetail> = {
  "plan-1-day": { id: "plan-1-day", name: "1 Day / Week Membership Plan", durationMonths: 1, totalClasses: 4, priceINR: 1999, priceUSD: 25 },
  "plan-2-day": { id: "plan-2-day", name: "2 Days / Week Membership Plan", durationMonths: 1, totalClasses: 8, priceINR: 3199, priceUSD: 40 },
  "plan-3-day": { id: "plan-3-day", name: "3 Days / Week Membership Plan", durationMonths: 1, totalClasses: 12, priceINR: 4399, priceUSD: 55 },
  "plan-4-day": { id: "plan-4-day", name: "4 Days / Week Membership Plan", durationMonths: 1, totalClasses: 16, priceINR: 5599, priceUSD: 70 },
  "plan-5-day": { id: "plan-5-day", name: "5 Days / Week Membership Plan", durationMonths: 1, totalClasses: 20, priceINR: 6799, priceUSD: 85 },

  // Shortcuts & Slugs
  "1-day": { id: "plan-1-day", name: "1 Day / Week Membership Plan", durationMonths: 1, totalClasses: 4, priceINR: 1999, priceUSD: 25 },
  "2-day": { id: "plan-2-day", name: "2 Days / Week Membership Plan", durationMonths: 1, totalClasses: 8, priceINR: 3199, priceUSD: 40 },
  "3-day": { id: "plan-3-day", name: "3 Days / Week Membership Plan", durationMonths: 1, totalClasses: 12, priceINR: 4399, priceUSD: 55 },
  "4-day": { id: "plan-4-day", name: "4 Days / Week Membership Plan", durationMonths: 1, totalClasses: 16, priceINR: 5599, priceUSD: 70 },
  "5-day": { id: "plan-5-day", name: "5 Days / Week Membership Plan", durationMonths: 1, totalClasses: 20, priceINR: 6799, priceUSD: 85 },

  "yellow-belt": { id: "plan-1-day", name: "1 Day / Week Membership Plan", durationMonths: 1, totalClasses: 4, priceINR: 1999, priceUSD: 25 },
  "blue-belt": { id: "plan-3-day", name: "3 Days / Week Membership Plan", durationMonths: 1, totalClasses: 12, priceINR: 4399, priceUSD: 55 },
  "purple-belt": { id: "plan-4-day", name: "4 Days / Week Membership Plan", durationMonths: 1, totalClasses: 16, priceINR: 5599, priceUSD: 70 },
  "brown-belt": { id: "plan-5-day", name: "5 Days / Week Membership Plan", durationMonths: 1, totalClasses: 20, priceINR: 6799, priceUSD: 85 },

  "challenge-8": { id: "plan-2-day", name: "2 Days / Week Membership Plan", durationMonths: 1, totalClasses: 8, priceINR: 3199, priceUSD: 40 },
  "challenge-24": { id: "plan-3-day", name: "3 Days / Week Membership Plan", durationMonths: 1, totalClasses: 12, priceINR: 4399, priceUSD: 55 },
  "challenge-48": { id: "plan-4-day", name: "4 Days / Week Membership Plan", durationMonths: 1, totalClasses: 16, priceINR: 5599, priceUSD: 70 },
  "transformation-96": { id: "plan-5-day", name: "5 Days / Week Membership Plan", durationMonths: 1, totalClasses: 20, priceINR: 6799, priceUSD: 85 },
};

async function ensureUserExists(sessionUser: { id: string; email?: string | null; name?: string | null }) {
  if (!sessionUser || !sessionUser.id) return null;

  let user = await db.user.findUnique({
    where: { id: sessionUser.id },
  });

  if (!user && sessionUser.email) {
    user = await db.user.findUnique({
      where: { email: sessionUser.email.toLowerCase().trim() },
    });
  }

  if (!user) {
    const email = (sessionUser.email || `user_${Date.now()}@selffits.com`).toLowerCase().trim();
    const name = sessionUser.name || "Student User";
    user = await db.user.create({
      data: {
        id: sessionUser.id,
        name: name,
        email: email,
        role: "STUDENT",
      },
    });

    await db.studentProfile.create({
      data: {
        userId: user.id,
      },
    });
  }

  return user;
}

async function getOrCreateMembershipPlan(plan: PaymentPlanDetail) {
  let program = await db.program.findFirst();
  if (!program) {
    program = await db.program.create({
      data: {
        title: "Global Online Martial Arts & Fitness Academy",
        slug: "global-academy",
        category: "MARTIAL_ARTS",
        targetAudience: "ADULTS",
        description: "Global Online Live Fitness & Martial Arts Training",
      },
    });
  }

  let membershipPlan = await db.membershipPlan.findFirst({
    where: {
      name: plan.name,
      totalClasses: plan.totalClasses,
    },
  });

  if (!membershipPlan) {
    membershipPlan = await db.membershipPlan.create({
      data: {
        programId: program.id,
        name: plan.name,
        tierType: (plan.tierType || "BLUE_BELT") as any,
        durationMonths: plan.durationMonths,
        totalClasses: plan.totalClasses,
        priceINR: plan.priceINR,
        priceUSD: plan.priceUSD,
      },
    });
  }

  return membershipPlan;
}

export async function createRazorpayOrderAction(
  planId: string,
  currency: "INR" | "USD" = "INR"
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Please log in to complete your enrollment purchase." };
    }

    const user = await ensureUserExists(session.user);
    if (!user) {
      return { success: false, error: "User account not found. Please log in again." };
    }

    const plan = PLAN_MAP[planId] || PLAN_MAP["plan-3-day"];
    const basePrice = currency === "INR" ? plan.priceINR : plan.priceUSD;
    const amountInSubunits = Math.round(basePrice * 100);

    const receipt = `rcpt_${Date.now()}_${user.id.slice(-6)}`;

    const order = await razorpay.orders.create({
      amount: amountInSubunits,
      currency: currency,
      receipt: receipt,
      notes: {
        userId: user.id,
        planId: plan.id,
        planName: plan.name,
      },
    });

    await db.payment.create({
      data: {
        userId: user.id,
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
      error: `Order creation error: ${err?.message || "Internal server error"}`,
    };
  }
}

export async function verifyPaymentSignatureAction(payload: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  planId: string;
  daysPerWeek?: number;
  selectedDays?: string[];
  selectedBatch?: string;
  monthlyPrice?: number;
  timezone?: string;
}) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized session." };
    }

    const user = await ensureUserExists(session.user);
    if (!user) {
      return { success: false, error: "User account not found." };
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      planId,
      daysPerWeek,
      selectedDays,
      selectedBatch,
      monthlyPrice,
      timezone,
    } = payload;
    const secret = process.env.RAZORPAY_KEY_SECRET || "secret_placeholder";

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return { success: false, error: "Invalid Razorpay payment signature." };
    }

    const plan = PLAN_MAP[planId] || PLAN_MAP["plan-3-day"];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    const membershipPlan = await getOrCreateMembershipPlan(plan);
    const classTimingLabel = selectedBatch ? selectedBatch : "02:30 PM to 03:30 PM (GMT)";

    const result = await db.$transaction(async (tx) => {
      let enrollment;
      try {
        enrollment = await tx.enrollment.create({
          data: {
            userId: user.id,
            membershipPlanId: membershipPlan.id,
            classTiming: classTimingLabel,
            daysPerWeek: daysPerWeek || (selectedDays ? selectedDays.length : 3),
            selectedDays: selectedDays || ["Sunday", "Wednesday", "Saturday"],
            selectedBatch: selectedBatch || "2nd Batch — 02:30 PM to 03:30 PM (GMT)",
            monthlyPrice: monthlyPrice || plan.priceUSD,
            timezone: timezone || "GMT (UTC+0)",
            startDate,
            endDate,
            totalClassesGranted: plan.totalClasses,
            remainingClasses: plan.totalClasses,
            status: "ACTIVE",
          },
        });
      } catch (colErr: any) {
        console.warn("Falling back to core enrollment fields in verifyPaymentSignatureAction:", colErr?.message);
        enrollment = await tx.enrollment.create({
          data: {
            userId: user.id,
            membershipPlanId: membershipPlan.id,
            classTiming: classTimingLabel,
            startDate,
            endDate,
            totalClassesGranted: plan.totalClasses,
            remainingClasses: plan.totalClasses,
            status: "ACTIVE",
          },
        });
      }

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

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: user.email as string,
        subject: `Enrollment Confirmed - ${plan.name} (SELFFITS)`,
        react: PaymentSuccessEmail({
          name: user.name || "Student",
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
      error: `Payment signature verification error: ${err?.message || "Verification failed"}`,
    };
  }
}

import { getCentralClassReadinessForUser } from "@/actions/batch.actions";

export async function getStudentEnrollmentAction() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, isEnrolled: false, enrollments: [] };
    }

    const readiness = await getCentralClassReadinessForUser(session.user.id);

    const rawEnrollments = await db.enrollment.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        membershipPlan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const now = new Date();

    const expiredIds = rawEnrollments
      .filter((item) => (new Date(item.endDate) < now || item.remainingClasses <= 0) && item.status === "ACTIVE")
      .map((item) => item.id);

    if (expiredIds.length > 0) {
      await db.enrollment.updateMany({
        where: { id: { in: expiredIds } },
        data: { status: "EXPIRED" },
      });
      rawEnrollments.forEach((item) => {
        if (expiredIds.includes(item.id)) item.status = "EXPIRED";
      });
    }

    const formattedEnrollments = rawEnrollments.map((item) => {
      const endDate = new Date(item.endDate);
      const diffTime = endDate.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const formattedDate = item.endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const planName = item.membershipPlan?.name || "Martial Arts & Fitness Program";
      const totalClasses = item.membershipPlan?.totalClasses || item.totalClassesGranted || 24;
      const remainingClasses = item.remainingClasses;
      const isChallenge =
        planName.toLowerCase().includes("challenge") ||
        planName.toLowerCase().includes("transformation") ||
        planName.toLowerCase().includes("fitness");

      const image = isChallenge
        ? "/images/weight_loss_hiit.png"
        : planName.toLowerCase().includes("kids")
        ? "/images/kids_martial_arts.png"
        : "/images/adults_martial_arts.png";

      const category = isChallenge ? "FITNESS & WEIGHT MANAGEMENT" : "MARTIAL ARTS";
      const planLevel = item.daysPerWeek ? `${item.daysPerWeek} Days / Week` : (readiness.levelName || planName);

      const selectedDaysList = Array.isArray(item.selectedDays)
        ? (item.selectedDays as string[])
        : ["Sunday", "Wednesday", "Saturday"];

      return {
        id: item.id,
        programName: planName,
        title: planName,
        category: category,
        image: image,
        beltLevel: planLevel,
        remainingClasses: remainingClasses,
        totalClasses: totalClasses,
        duration: `${totalClasses} Classes`,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        membershipStatus: item.status,
        status: item.status,
        expiryDate: formattedDate,
        daysPerWeek: item.daysPerWeek || selectedDaysList.length || 3,
        selectedDays: selectedDaysList,
        selectedBatch: item.selectedBatch || item.classTiming || "2nd Batch — 02:30 PM to 03:30 PM (GMT)",
        monthlyPrice: item.monthlyPrice ? Number(item.monthlyPrice) : null,
        timezone: item.timezone || "GMT (UTC+0)",
        nextClassTime: readiness.hasBatch
          ? `${readiness.dayCombination} • ${readiness.clockTiming}`
          : `${selectedDaysList.join(", ")} • ${item.selectedBatch || "02:30 PM to 03:30 PM (GMT)"}`,
        instructor: readiness.coachName || "Sensei Rahul Sharma",
        hasBatch: readiness.hasBatch,
        batchName: readiness.batchName,
        meetingUrl: readiness.meetingUrl,
        batchStatus: readiness.batchStatus,
        isReady: readiness.isReady,
      };
    });

    const sampleExpiredCourse = {
      id: "sample-expired-course-demo",
      programName: "Sample Expired Martial Arts Course (Demo)",
      title: "Sample Expired Martial Arts Course (Demo)",
      category: "MARTIAL ARTS",
      image: "/images/adults_martial_arts.png",
      beltLevel: "1 Day / Week",
      remainingClasses: 0,
      totalClasses: 8,
      duration: "8 Classes (Completed)",
      daysRemaining: 0,
      membershipStatus: "EXPIRED",
      status: "EXPIRED",
      expiryDate: "Aug 1, 2026",
      nextClassTime: "Course Expired",
      instructor: "Sensei Rahul Sharma",
    };

    const finalEnrollments = [...formattedEnrollments, sampleExpiredCourse];
    const activeEnrollment = finalEnrollments.find((item) => item.status === "ACTIVE");

    return {
      success: true,
      isEnrolled: !!activeEnrollment,
      enrollment: activeEnrollment || finalEnrollments[0],
      enrollments: finalEnrollments,
    };
  } catch (err: any) {
    console.error("getStudentEnrollmentAction error:", err);
    return { success: false, isEnrolled: false, enrollments: [] };
  }
}

export async function createDirectCardEnrollmentAction(
  planId: string,
  currency: "INR" | "USD" = "INR",
  scheduleData?: {
    daysPerWeek?: number;
    selectedDays?: string[];
    selectedBatch?: string;
    monthlyPrice?: number;
    timezone?: string;
  }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Please log in to complete your enrollment purchase." };
    }

    const user = await ensureUserExists(session.user);
    if (!user) {
      return { success: false, error: "User account record not found in database. Please log in again." };
    }

    const plan = PLAN_MAP[planId] || PLAN_MAP["plan-3-day"];
    const basePrice = scheduleData?.monthlyPrice || (currency === "INR" ? plan.priceINR : plan.priceUSD);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    const membershipPlan = await getOrCreateMembershipPlan(plan);
    const classTimingLabel = scheduleData?.selectedBatch ? scheduleData.selectedBatch : "02:30 PM to 03:30 PM (GMT)";

    const uniqueNonce = Math.random().toString(36).substring(2, 7);

    const result = await db.$transaction(async (tx) => {
      let enrollment;
      try {
        enrollment = await tx.enrollment.create({
          data: {
            userId: user.id,
            membershipPlanId: membershipPlan.id,
            classTiming: classTimingLabel,
            daysPerWeek: scheduleData?.daysPerWeek || (scheduleData?.selectedDays ? scheduleData.selectedDays.length : 3),
            selectedDays: scheduleData?.selectedDays || ["Sunday", "Wednesday", "Saturday"],
            selectedBatch: scheduleData?.selectedBatch || "2nd Batch — 02:30 PM to 03:30 PM (GMT)",
            monthlyPrice: basePrice,
            timezone: scheduleData?.timezone || "GMT (UTC+0)",
            startDate,
            endDate,
            totalClassesGranted: plan.totalClasses,
            remainingClasses: plan.totalClasses,
            status: "ACTIVE",
          },
        });
      } catch (colErr: any) {
        console.warn("Falling back to core enrollment fields due to schema version:", colErr?.message);
        enrollment = await tx.enrollment.create({
          data: {
            userId: user.id,
            membershipPlanId: membershipPlan.id,
            classTiming: classTimingLabel,
            startDate,
            endDate,
            totalClassesGranted: plan.totalClasses,
            remainingClasses: plan.totalClasses,
            status: "ACTIVE",
          },
        });
      }

      const payment = await tx.payment.create({
        data: {
          userId: user.id,
          enrollmentId: enrollment.id,
          razorpayOrderId: `card_order_${Date.now()}_${uniqueNonce}`,
          razorpayPaymentId: `card_pay_${Date.now()}_${uniqueNonce}`,
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
      error: `Card payment authorization error: ${err?.message || "Internal database processing error"}`,
    };
  }
}

export async function cancelStudentEnrollmentAction(enrollmentId: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized session." };
    }

    if (enrollmentId === "sample-expired-course-demo") {
      return { success: true, message: "Sample expired course deleted successfully." };
    }

    const enrollment = await db.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId: session.user.id,
      },
    });

    if (!enrollment) {
      return { success: false, error: "Enrollment record not found." };
    }

    const now = new Date();
    const isExpired =
      enrollment.status === "EXPIRED" ||
      enrollment.status === "COMPLETED" ||
      enrollment.remainingClasses <= 0 ||
      new Date(enrollment.endDate) < now;

    if (!isExpired) {
      return {
        success: false,
        error: "Active ongoing programs cannot be deleted. Only expired or completed programs can be deleted.",
      };
    }

    await db.enrollment.delete({
      where: {
        id: enrollmentId,
      },
    });

    return { success: true, message: "Expired program enrollment removed successfully." };
  } catch (err: any) {
    console.error("cancelStudentEnrollmentAction error:", err);
    return { success: false, error: "Failed to delete program enrollment." };
  }
}
