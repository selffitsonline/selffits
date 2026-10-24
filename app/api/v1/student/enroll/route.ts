import { NextResponse } from "next/server";
import crypto from "crypto";
import { Role } from "@prisma/client";
import { db, ensureCouponTables } from "@/lib/db";
import { verifyMobileAuth, enforceMobileRole } from "@/lib/mobile-auth";
import {
  getDefaultScheduleConfig,
  getCompositeDbKey,
  CentralScheduleConfig,
  DEFAULT_MARTIAL_ARTS_TYPE_ITEMS,
  normalizeMartialArtsTypeItems,
} from "@/lib/schedule-config";
import { validateCouponAction } from "@/actions/coupons.actions";
import {
  ApiResponse,
  MobileEnrollmentSchema,
  MobileEnrollmentResponseDto,
} from "@/types/mobile-api.dto";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request
): Promise<NextResponse<ApiResponse<MobileEnrollmentResponseDto>>> {
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

    // 3. Parse and Validate Request Payload
    let body: unknown;
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

    const validationResult = MobileEnrollmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid enrollment parameters.",
            fieldErrors: validationResult.error.flatten().fieldErrors,
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
      martialArtsType,
      includeDietNutrition,
      couponCode,
      paymentMethod: _paymentMethod,
      currency,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = validationResult.data;

    // 4. Fetch Authoritative Backend Configuration (Single Source of Truth)
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
    } catch (err) {
      console.warn(`Error loading config for ${configKey}:`, err);
    }

    // 5. Authoritatively Validate Membership Plan
    const matchingPlan = (categoryConfig.membershipPlans || []).find(
      (p) => p.daysPerWeek === daysPerWeek && p.activeStatus !== false
    );
    if (!matchingPlan) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PLAN",
            message: `Membership plan for ${daysPerWeek} days/week is not available for this program.`,
          },
        },
        { status: 400 }
      );
    }

    // 6. Authoritatively Validate Selected Days
    if (selectedDays.length !== daysPerWeek) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_DAYS_COUNT",
            message: `Please select exactly ${daysPerWeek} training day(s).`,
          },
        },
        { status: 400 }
      );
    }

    const availableDays = categoryConfig.trainingDays || [];
    for (const day of selectedDays) {
      const dayConfig = availableDays.find(
        (d) => d.dayName.toLowerCase() === day.toLowerCase()
      );
      if (!dayConfig || dayConfig.restDay || !dayConfig.selectable) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_TRAINING_DAY",
              message: `${day} is configured as a rest day or is unavailable for this schedule.`,
            },
          },
          { status: 400 }
        );
      }
    }

    // 7. Authoritatively Validate Batch Timing
    const matchingBatch = (categoryConfig.batchTimings || []).find(
      (b) => b.id === batchId && b.activeStatus !== false
    );
    if (!matchingBatch) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_BATCH",
            message: "The selected batch timing is no longer active.",
          },
        },
        { status: 400 }
      );
    }
    const batchDisplayLabel = `${matchingBatch.batchName} — ${matchingBatch.displayLabel} (${matchingBatch.timezone})`;

    // 8. Authoritatively Validate Martial Arts Discipline (if MMA)
    let validatedMartialArtsType: string | null = null;
    if (programCategory === "mma") {
      let validTypes = DEFAULT_MARTIAL_ARTS_TYPE_ITEMS.map((t) => t.label);
      try {
        const catSetting = await db.websiteSettings.findUnique({
          where: { key: "programs_catalog" },
        });
        if (catSetting && catSetting.value) {
          const raw = catSetting.value as any;
          if (raw.martialArtsTypes) {
            validTypes = normalizeMartialArtsTypeItems(raw.martialArtsTypes).map(
              (t) => t.label
            );
          }
        }
      } catch {}

      if (martialArtsType) {
        const matched = validTypes.find(
          (t) => t.toLowerCase() === martialArtsType.toLowerCase()
        );
        validatedMartialArtsType = matched || validTypes[0];
      } else {
        validatedMartialArtsType = validTypes[0];
      }
    }

    // 9. Authoritatively Calculate Pricing on Server (Prevent client price tampering)
    const basePrice =
      currency === "INR"
        ? matchingPlan.monthlyPriceINR
        : matchingPlan.monthlyPriceUSD;

    let dietAddonPrice = 0;
    if (includeDietNutrition) {
      try {
        const dietSetting = await db.websiteSettings.findUnique({
          where: { key: "diet_nutrition_config" },
        });
        if (dietSetting && dietSetting.value) {
          const stored = dietSetting.value as any;
          if (stored.activeStatus !== false) {
            dietAddonPrice =
              currency === "INR"
                ? (stored.priceINR || (stored.priceUSD ? stored.priceUSD * 80 : 800))
                : (stored.priceUSD ?? 10);
          }
        } else {
          dietAddonPrice = currency === "INR" ? 800 : 10;
        }
      } catch {
        dietAddonPrice = currency === "INR" ? 800 : 10;
      }
    }

    const subtotal = basePrice + dietAddonPrice;
    let finalAmount = subtotal;
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;

    // 10. Server-side Coupon Validation
    if (couponCode && couponCode.trim()) {
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

    // 11. Find or create Program & MembershipPlan records in DB
    const programTitle =
      programCategory === "mma"
        ? audienceGroup === "kids"
          ? "Kids Martial Arts"
          : audienceGroup === "ladies"
          ? "Ladies Only Martial Arts"
          : "Adults Mixed Martial Arts"
        : audienceGroup === "kids"
        ? "Kids Fitness & Weight Management"
        : audienceGroup === "ladies"
        ? "Ladies Fitness & Weight Management"
        : "Adult Fitness & Weight Management";

    let program = await db.program.findFirst({
      where: {
        category: programCategory === "mma" ? "MARTIAL_ARTS" : "FITNESS_WEIGHT_LOSS",
      },
    });

    if (!program) {
      program = await db.program.create({
        data: {
          title: programTitle,
          slug: `${programCategory}-${audienceGroup}`,
          category: programCategory === "mma" ? "MARTIAL_ARTS" : "FITNESS_WEIGHT_LOSS",
          targetAudience:
            audienceGroup === "kids"
              ? "KIDS"
              : audienceGroup === "ladies"
              ? "LADIES_ONLY"
              : "ADULTS",
          description: "Authoritative Online Training Curriculum",
        },
      });
    }

    const planName = `${daysPerWeek} ${daysPerWeek === 1 ? "Day" : "Days"} / Week Membership Plan`;
    const totalClasses = daysPerWeek * 4; // 4 weeks in a monthly billing cycle

    let membershipPlan = await db.membershipPlan.findFirst({
      where: {
        name: planName,
        totalClasses,
      },
    });

    if (!membershipPlan) {
      membershipPlan = await db.membershipPlan.create({
        data: {
          programId: program.id,
          name: planName,
          tierType: "BLUE_BELT",
          durationMonths: 1,
          totalClasses,
          priceINR: matchingPlan.monthlyPriceINR,
          priceUSD: matchingPlan.monthlyPriceUSD,
        },
      });
    }

    // 12. Prevent Duplicate Active Enrollment
    const now = new Date();
    const existingActiveEnrollment = await db.enrollment.findFirst({
      where: {
        userId: authResult.user.id,
        membershipPlan: {
          programId: program.id,
        },
        status: "ACTIVE",
        endDate: { gt: now },
        remainingClasses: { gt: 0 },
      },
    });

    if (existingActiveEnrollment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_ACTIVE_ENROLLMENT",
            message:
              "You already have an active enrollment for this program. Please view your active schedule from the dashboard or renew after completing your classes.",
          },
        },
        { status: 409 }
      );
    }

    // 13. Payment Verification & Gateway Enforcement
    // RULE: Never create a successful payment record or activate a paid enrollment
    // based solely on client-side card validation or unverified direct_card_authorization.
    let verifiedOrderId: string;
    let verifiedPaymentId: string;
    let verifiedSignature: string;

    if (finalAmount > 0) {
      // Paid enrollment strictly requires cryptographic gateway transaction verification
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "PAYMENT_VERIFICATION_REQUIRED",
              message:
                "Payment gateway verification required. Unverified card submissions and direct authorizations cannot activate a paid enrollment. A valid payment gateway signature is required.",
            },
          },
          { status: 400 }
        );
      }

      // Explicitly reject any attempt to pass "direct_card_authorization" as a verified signature
      if (razorpaySignature === "direct_card_authorization") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DIRECT_CARD_AUTHORIZATION_DISALLOWED",
              message:
                "Direct card authorization is disabled for mobile enrollment. Cryptographic gateway verification is required.",
            },
          },
          { status: 400 }
        );
      }

      // Cryptographically verify the HMAC-SHA256 signature using RAZORPAY_KEY_SECRET
      const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_selffits_secret_key";
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_PAYMENT_SIGNATURE",
              message:
                "Cryptographic payment verification failed. The provided payment signature is invalid.",
            },
          },
          { status: 400 }
        );
      }

      verifiedOrderId = razorpayOrderId;
      verifiedPaymentId = razorpayPaymentId;
      verifiedSignature = razorpaySignature;
    } else {
      // 100% coupon discount (Free / fully subsidized enrollment authorized server-side)
      const uniqueNonce = Math.random().toString(36).substring(2, 7);
      verifiedOrderId = `promo_order_${Date.now()}_${uniqueNonce}`;
      verifiedPaymentId = `promo_pay_${Date.now()}_${uniqueNonce}`;
      verifiedSignature = "authorized_promotional_coupon";
    }

    // 14. Create Enrollment and Payment Transaction
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const transactionResult = await db.$transaction(async (tx) => {
      // Create Enrollment with schema resilience
      let enrollment: any;
      try {
        enrollment = await tx.enrollment.create({
          data: {
            userId: authResult.user.id,
            membershipPlanId: membershipPlan.id,
            martialArtsType: validatedMartialArtsType,
            classTiming: matchingBatch.displayLabel,
            daysPerWeek,
            selectedDays,
            selectedBatch: batchDisplayLabel,
            monthlyPrice: finalAmount,
            couponCode: appliedCouponCode,
            discountAmount: discountAmount > 0 ? discountAmount : null,
            originalAmount: subtotal,
            includeDietNutrition: !!includeDietNutrition,
            dietNutritionPrice: dietAddonPrice,
            timezone: matchingBatch.timezone,
            startDate,
            endDate,
            totalClassesGranted: totalClasses,
            remainingClasses: totalClasses,
            status: "ACTIVE",
          },
        });
      } catch (colErr: any) {
        console.warn("Falling back to core enrollment fields in mobile enroll route:", colErr?.message);
        enrollment = await tx.enrollment.create({
          data: {
            userId: authResult.user.id,
            membershipPlanId: membershipPlan.id,
            martialArtsType: validatedMartialArtsType,
            classTiming: matchingBatch.displayLabel,
            monthlyPrice: finalAmount,
            couponCode: appliedCouponCode,
            discountAmount: discountAmount > 0 ? discountAmount : null,
            originalAmount: subtotal,
            startDate,
            endDate,
            totalClassesGranted: totalClasses,
            remainingClasses: totalClasses,
            status: "ACTIVE",
          },
        });
      }

      // Create Payment Record (only with verified gateway signature or authorized 100% discount)
      let payment: any;
      try {
        payment = await tx.payment.create({
          data: {
            userId: authResult.user.id,
            enrollmentId: enrollment.id,
            amount: finalAmount,
            currency,
            originalAmount: subtotal,
            discountAmount: discountAmount > 0 ? discountAmount : null,
            couponCode: appliedCouponCode,
            status: "SUCCESS",
            razorpayOrderId: verifiedOrderId,
            razorpayPaymentId: verifiedPaymentId,
            razorpaySignature: verifiedSignature,
          },
        });
      } catch (payColErr: any) {
        console.warn("Falling back to core payment fields in mobile enroll route:", payColErr?.message);
        payment = await tx.payment.create({
          data: {
            userId: authResult.user.id,
            enrollmentId: enrollment.id,
            amount: finalAmount,
            currency,
            status: "SUCCESS",
            razorpayOrderId: verifiedOrderId,
            razorpayPaymentId: verifiedPaymentId,
            razorpaySignature: verifiedSignature,
          },
        });
      }

      // Record coupon usage if coupon applied
      if (appliedCouponCode) {
        try {
          const couponRecord = await tx.coupon.findUnique({
            where: { code: appliedCouponCode },
          });
          if (couponRecord) {
            await tx.couponUsage.create({
              data: {
                couponId: couponRecord.id,
                userId: authResult.user.id,
                userEmail: authResult.user.email,
                paymentId: payment.id,
                orderId: verifiedOrderId,
                discountApplied: discountAmount,
              },
            });
            await tx.coupon.update({
              where: { id: couponRecord.id },
              data: { usageCount: { increment: 1 } },
            });
          }
        } catch (couponErr: any) {
          console.warn("Non-fatal coupon usage tracking error:", couponErr?.message);
        }
      }

      return { enrollment, payment };
    });

    const responsePayload: MobileEnrollmentResponseDto = {
      enrollmentId: transactionResult.enrollment.id,
      programTitle,
      tierName: membershipPlan.name,
      totalClassesGranted: totalClasses,
      remainingClasses: totalClasses,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: "ACTIVE",
      amountPaid: finalAmount,
      currency,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      couponCode: appliedCouponCode,
      martialArtsType: validatedMartialArtsType,
      includeDietNutrition: !!includeDietNutrition,
      batchName: matchingBatch.batchName,
      classTiming: matchingBatch.displayLabel,
      daysPerWeek,
      selectedDays,
    };

    return NextResponse.json(
      {
        success: true,
        data: responsePayload,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/v1/student/enroll error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ENROLLMENT_PROCESSING_FAILED",
          message: error?.message || "An unexpected error occurred during enrollment processing.",
        },
      },
      { status: 500 }
    );
  }
}
