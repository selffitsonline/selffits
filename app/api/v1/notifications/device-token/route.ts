import { NextResponse } from "next/server";
import { verifyMobileAuth } from "@/lib/mobile-auth";
import { DeviceTokenStore } from "@/lib/device-token-store";
import {
  ApiResponse,
  RegisterDeviceTokenSchema,
  UnregisterDeviceTokenSchema,
} from "@/types/mobile-api.dto";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/notifications/device-token
 * Registers or refreshes a device token for the authenticated user.
 */
export async function POST(req: Request): Promise<NextResponse<ApiResponse<any>>> {
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

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "Request body must be valid JSON.",
          },
        },
        { status: 400 }
      );
    }

    const validation = RegisterDeviceTokenSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid device token registration payload.",
            fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { token, platform, deviceId } = validation.data;

    const registered = await DeviceTokenStore.registerToken({
      userId: authResult.user.id,
      role: authResult.user.role,
      token,
      platform,
      deviceId,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          registered: true,
          platform: registered.platform,
          lastUsedAt: registered.lastUsedAt,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("POST /api/v1/notifications/device-token error:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to register device token.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/notifications/device-token
 * Unregisters a device token upon logout.
 */
export async function DELETE(req: Request): Promise<NextResponse<ApiResponse<any>>> {
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

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "Request body must be valid JSON.",
          },
        },
        { status: 400 }
      );
    }

    const validation = UnregisterDeviceTokenSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid token payload.",
          },
        },
        { status: 400 }
      );
    }

    const { token } = validation.data;

    const unregistered = await DeviceTokenStore.unregisterToken(
      token,
      authResult.user.id
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          unregistered,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("DELETE /api/v1/notifications/device-token error:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to unregister device token.",
        },
      },
      { status: 500 }
    );
  }
}
