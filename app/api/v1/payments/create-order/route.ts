import { NextResponse } from "next/server";
import crypto from "crypto";
import { Role } from "@prisma/client";
import { db, ensureCouponTables } from "@/lib/db";
import { razorpay } from "@/lib/razorpay";
import { verifyMobileAuth, enforceMobileRole } from "@/lib/mobile-auth";
import {
  getDefaultScheduleConfig,
  getCompositeDbKey,
  CentralScheduleConfig,
} from "@/lib/schedule-config";
import { validateCouponAction } from "@/actions/coupons.actions";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. Enforce Authentication
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

    // 2. Enforce Student Role (Admins also allowed to test)
    const roleCheck = enforceMobileRole(authResult.user, [
      Role.STUDENT,
      Role.ADMIN,
      Role.SUPER_ADMIN,
    ]);
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

    // 3. Parse Request Body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JSON_BODY",
            message: "Request body must be a valid JSON object.",
          },
        },
        { status: 400 }
      );
    }

    const {
      programCategory,
      audienceGroup,
      daysPerWeek,
      selectedDays,
      batchId,
      includeDietNutrition,
      couponCode,
      currency = "USD",
    } = body;

    if (!programCategory || !audienceGroup || !daysPerWeek || !batchId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_REQUIRED_FIELDS",
            message: "programCategory, audienceGroup, daysPerWeek, and batchId are required.",
          },
        },
        { status: 400 }
      );
    }

    // 4. Fetch Authoritative Backend Pricing Configuration
    const configKey = getCompositeDbKey(programCategory, audienceGroup);
    const defaultConfig = getDefaultScheduleConfig(programCategory, audienceGroup);
    let categoryConfig: CentralScheduleConfig = defaultConfig;

    try {
      const setting = await db.websiteSettings.findUnique({
        where: { key: configKey },
      });
      if (setting && setting.value) {
        const stored = setting.value as unknown as CentralScheduleConfig;
        categoryConfig = {
          trainingDays: stored.trainingDays || defaultConfig.trainingDays,
          batchTimings: stored.batchTimings || defaultConfig.batchTimings,
          membershipPlans: stored.membershipPlans || defaultConfig.membershipPlans,
        };
      }
    } catch (dbErr) {
      console.warn("Using default schedule config fallback in create-order:", dbErr);
    }

    // Validate Membership Plan
    const matchingPlan = categoryConfig.membershipPlans.find(
      (p) => p.daysPerWeek === Number(daysPerWeek) && p.activeStatus !== false
    );
    if (!matchingPlan) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_MEMBERSHIP_PLAN",
            message: `No active plan found for ${daysPerWeek} days per week.`,
          },
        },
        { status: 400 }
      );
    }

    const basePrice = currency === "INR" ? matchingPlan.monthlyPriceINR : matchingPlan.monthlyPriceUSD;
    let dietAddonPrice = 0;
    if (includeDietNutrition) {
      dietAddonPrice = currency === "INR" ? 799 : 10;
    }

    const subtotal = basePrice + dietAddonPrice;
    let finalAmount = subtotal;
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;

    // Validate Coupon if provided
    if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
      await ensureCouponTables();
      const couponRes = await validateCouponAction({
        code: couponCode.trim(),
        currentAmount: subtotal,
        userId: authResult.user.id,
        userEmail: authResult.user.email,
      });

      if (!couponRes.success || !couponRes.coupon) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_COUPON",
              message: couponRes.error || "The provided coupon code is invalid or expired.",
            },
          },
          { status: 400 }
        );
      }

      discountAmount = couponRes.discountAmount || 0;
      finalAmount = couponRes.finalAmount !== undefined ? couponRes.finalAmount : Math.max(0, subtotal - discountAmount);
      appliedCouponCode = couponRes.coupon.code;
    }

    const isTestMode = (process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_test_");
    const amountInSubunits = Math.round(finalAmount * 100);
    const receipt = `rcpt_${Date.now()}_${authResult.user.id.slice(-6)}`;

    let orderId: string;
    if (finalAmount > 0) {
      try {
        const order = await razorpay.orders.create({
          amount: amountInSubunits,
          currency: currency,
          receipt: receipt,
          notes: {
            userId: authResult.user.id,
            programCategory,
            audienceGroup,
            daysPerWeek: String(daysPerWeek),
            couponCode: appliedCouponCode || "",
          },
        });
        orderId = order.id;
      } catch (err: any) {
        // In local test mode with placeholder test credentials, generate compliant test order ID
        if (isTestMode) {
          orderId = `order_test_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
        } else {
          console.error("Razorpay order creation error:", err);
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "ORDER_CREATION_FAILED",
                message: "Unable to create payment gateway order. Please check credentials.",
              },
            },
            { status: 502 }
          );
        }
      }

      // Record pending payment in database
      await db.payment.create({
        data: {
          userId: authResult.user.id,
          razorpayOrderId: orderId,
          amount: finalAmount,
          originalAmount: subtotal,
          discountAmount: discountAmount > 0 ? discountAmount : null,
          couponCode: appliedCouponCode,
          currency: currency,
          status: "PENDING",
        },
      });
    } else {
      orderId = `promo_order_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId,
          amount: finalAmount,
          amountInSubunits,
          originalAmount: subtotal,
          discountAmount,
          currency,
          keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_selffits_key_id",
          isTestMode,
          planName: matchingPlan.label || `${daysPerWeek} Days / Week Membership Plan`,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/v1/payments/create-order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_PROCESSING_FAILED",
          message: error?.message || "Failed to create payment gateway order.",
        },
      },
      { status: 500 }
    );
  }
}
