import { NextResponse } from "next/server";
import { validateCouponAction } from "@/actions/coupons.actions";
import { verifyMobileAuth } from "@/lib/mobile-auth";
import {
  ApiResponse,
  MobileCouponValidationSchema,
  MobileCouponValidationResponseDto,
} from "@/types/mobile-api.dto";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request
): Promise<NextResponse<ApiResponse<MobileCouponValidationResponseDto>>> {
  try {
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

    const validationResult = MobileCouponValidationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid coupon validation parameters.",
            fieldErrors: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { code, currentAmount } = validationResult.data;

    // Optional mobile auth to check per-user coupon limits
    let userId: string | undefined;
    let userEmail: string | undefined;
    try {
      const authResult = await verifyMobileAuth(req);
      if (authResult.success) {
        userId = authResult.user.id;
        userEmail = authResult.user.email;
      }
    } catch {
      // Continue without user identification if unauthenticated
    }

    const result = await validateCouponAction({
      code,
      currentAmount,
      userId,
      userEmail,
    });

    if (!result.success || !result.coupon) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_COUPON",
            message: result.error || "Invalid coupon code.",
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          code: result.coupon.code,
          discountType: result.coupon.discountType,
          discountValue: result.coupon.discountValue,
          discountAmount: result.discountAmount || 0,
          finalAmount:
            result.finalAmount !== undefined
              ? result.finalAmount
              : Math.max(0, currentAmount - (result.discountAmount || 0)),
          originalAmount: result.originalAmount || currentAmount,
          description: result.coupon.description || null,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/v1/coupons/validate error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "COUPON_VALIDATION_ERROR",
          message: "Unable to validate coupon at this time.",
        },
      },
      { status: 500 }
    );
  }
}
