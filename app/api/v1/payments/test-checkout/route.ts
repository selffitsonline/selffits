import { NextResponse } from "next/server";
import crypto from "crypto";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyMobileAuth, enforceMobileRole } from "@/lib/mobile-auth";

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

    // 3. Ensure Environment is in Test Mode
    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const isTestMode = keyId.startsWith("rzp_test_") || process.env.NODE_ENV !== "production";
    if (!isTestMode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "LIVE_PAYMENTS_REQUIRE_OFFICIAL_GATEWAY_SDK",
            message:
              "Direct test authorization is strictly disabled in production live payment mode. Live transactions must be processed via the official Razorpay Checkout SDK.",
          },
        },
        { status: 403 }
      );
    }

    // 4. Parse and Validate Request Body
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

    const { orderId, cardNumber, cardExpiry, cardCvv } = body;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_ORDER_ID",
            message: "orderId is required.",
          },
        },
        { status: 400 }
      );
    }

    // 5. Look up the pending payment record in DB
    const payment = await db.payment.findUnique({
      where: { razorpayOrderId: orderId },
    });

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "No pending payment order found matching the provided order ID.",
          },
        },
        { status: 404 }
      );
    }

    if (payment.userId !== authResult.user.id && authResult.user.role === Role.STUDENT) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED_ORDER_ACCESS",
            message: "You are not authorized to process payment for this order.",
          },
        },
        { status: 403 }
      );
    }

    // 6. Validate Test Card Details
    const cleanCard = (cardNumber || "").replace(/\s/g, "");
    if (cleanCard.length < 15 || !/^\d+$/.test(cleanCard)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CARD_NUMBER",
            message: "Please enter a valid test card number (or click Auto-Fill Test Card).",
          },
        },
        { status: 400 }
      );
    }

    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_EXPIRY",
            message: "Please enter a valid card expiry date (MM/YY).",
          },
        },
        { status: 400 }
      );
    }

    if (!cardCvv || cardCvv.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CVV",
            message: "Please enter a valid CVV code.",
          },
        },
        { status: 400 }
      );
    }

    // Simulated decline test card (ends in 0000 or 0002)
    if (cleanCard.endsWith("0000") || cleanCard.endsWith("0002")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PAYMENT_DECLINED",
            message: "The payment gateway test transaction was declined by the issuing test bank.",
          },
        },
        { status: 400 }
      );
    }

    // 7. Generate Official Test Payment ID and HMAC-SHA256 Signature
    const paymentId = `pay_test_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_selffits_secret_key";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return NextResponse.json(
      {
        success: true,
        data: {
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/v1/payments/test-checkout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "TEST_CHECKOUT_FAILED",
          message: error?.message || "Failed to process test payment authorization.",
        },
      },
      { status: 500 }
    );
  }
}
