import { NextResponse } from "next/server";
import { verifyMobileAuth } from "@/lib/mobile-auth";
import { db } from "@/lib/db";
import { ApiResponse, MobileUserSummaryDto } from "@/types/mobile-api.dto";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<NextResponse<ApiResponse<MobileUserSummaryDto>>> {
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

    // Live database re-verification to enforce immediate revocation if account is blocked or deleted
    let liveUser = await db.user.findUnique({
      where: { id: authResult.user.id },
      select: { id: true, name: true, email: true, role: true, isBlocked: true },
    });

    if (!liveUser && authResult.user.email) {
      liveUser = await db.user.findUnique({
        where: { email: authResult.user.email.toLowerCase().trim() },
        select: { id: true, name: true, email: true, role: true, isBlocked: true },
      });
    }

    if (!liveUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User account no longer exists.",
          },
        },
        { status: 401 }
      );
    }

    if (liveUser.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACCOUNT_BLOCKED",
            message: "Your account has been blocked by an administrator.",
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: liveUser.id,
          name: liveUser.name,
          email: liveUser.email,
          role: liveUser.role,
          isBlocked: liveUser.isBlocked,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Mobile API Auth Me Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify user profile.",
        },
      },
      { status: 500 }
    );
  }
}
