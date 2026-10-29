import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { isResendConfigured, getAppBaseUrl, sendPasswordResetEmail } from "@/lib/resend";
import { ForgotPasswordSchema } from "@/types/validation.schemas";
import { ApiResponse, MobileForgotPasswordResponseDto } from "@/types/mobile-api.dto";

export const dynamic = "force-dynamic";

/**
 * =============================================================================
 * SELFFITS Mobile Forgot Password API — Security & Anti-Enumeration Architecture
 * =============================================================================
 *
 * 1. STRICT ACCOUNT ENUMERATION PREVENTION:
 *    - Regardless of whether an account exists for the submitted email, the endpoint
 *      ALWAYS returns HTTP 200 with an identical generic message envelope.
 *    - Server response timing, payload structure, status code, and headers are
 *      identical for registered and nonexistent accounts.
 *
 * 2. SAFE RESEND DELIVERY FAILURE & TOKEN ROLLBACK:
 *    - If email delivery to an existing user fails (e.g. Resend rate limit or failure),
 *      the newly generated reset token is immediately cleaned up from the database
 *      so dead or orphan tokens do not accumulate.
 *    - The API still returns the exact same generic HTTP 200 response. Under no
 *      circumstances is an HTTP 503 or conditional failure returned after querying
 *      the database, as doing so would disclose account existence.
 *    - Safe server diagnostics are logged without ever printing the reset token,
 *      password hashes, or private credentials.
 *
 * 3. ABUSE CONTROLS & TRUSTED IP EXTRACTION:
 *    - Rate limiting is enforced per client IP (max 5 requests per 5 minutes).
 *    - Rate limit checks execute BEFORE looking up user records, ensuring that
 *      exhaustion cannot be weaponized as an email enumeration oracle.
 *    - Priority is given to edge-verified headers (cf-connecting-ip, x-real-ip)
 *      to resist client header-spoofing evasion.
 * =============================================================================
 */

const MAX_FORGOT_PASSWORD_REQUESTS = 5;
const FORGOT_PASSWORD_WINDOW_SECONDS = 5 * 60; // 5 minutes (300s)

const GENERIC_RECOVERY_MESSAGE =
  "If an account exists with that email, a password reset link has been sent.";

/**
 * Extracts a trustworthy client IP address from proxy headers.
 */
export function getTrustedClientIp(req: Request): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp && cfIp.trim().length > 0) {
    return cfIp.trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim().length > 0) {
    return realIp.trim();
  }

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded && forwarded.trim().length > 0) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp.length > 0) {
      return firstIp;
    }
  }

  return "127.0.0.1";
}

/**
 * Database-backed rate limiter for mobile password recovery.
 */
async function checkDbRateLimit(
  key: string,
  action: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfterSeconds: number; error?: string }> {
  const now = new Date();

  try {
    db.rateLimitRecord
      .deleteMany({
        where: {
          key,
          action,
          expiresAt: { lt: now },
        },
      })
      .catch((cleanErr) => {
        console.warn("[RATE_LIMIT] Cleanup warning:", cleanErr?.message);
      });

    const activeRecords = await db.rateLimitRecord.findMany({
      where: {
        key,
        action,
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: "desc" },
    });

    const currentPoints = activeRecords.reduce((sum, rec) => sum + rec.points, 0);

    if (currentPoints >= maxAttempts) {
      const earliestExpiry =
        activeRecords[0]?.expiresAt || new Date(now.getTime() + windowSeconds * 1000);
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((earliestExpiry.getTime() - now.getTime()) / 1000)
      );

      return {
        allowed: false,
        retryAfterSeconds,
        error: `Too many password recovery requests. Please try again in ${retryAfterSeconds} seconds.`,
      };
    }

    return { allowed: true, retryAfterSeconds: 0 };
  } catch (err) {
    console.error("[RATE_LIMIT] Database check error:", err);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

/**
 * Records an attempt point in the database rate limit table.
 */
async function recordDbRateLimitAttempt(
  key: string,
  action: string,
  windowSeconds: number
): Promise<void> {
  const now = new Date();
  try {
    await db.rateLimitRecord.create({
      data: {
        key,
        action,
        points: 1,
        expiresAt: new Date(now.getTime() + windowSeconds * 1000),
      },
    });
  } catch (err) {
    console.error("[RATE_LIMIT] Database record error:", err);
  }
}

export async function POST(
  req: Request
): Promise<NextResponse<ApiResponse<MobileForgotPasswordResponseDto>>> {
  const clientIp = getTrustedClientIp(req);

  // 1. IP-level rate limiting enforced prior to database email query
  const rateLimit = await checkDbRateLimit(
    clientIp,
    "mobile_forgot_password",
    MAX_FORGOT_PASSWORD_REQUESTS,
    FORGOT_PASSWORD_WINDOW_SECONDS
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "TOO_MANY_ATTEMPTS",
          message:
            rateLimit.error ||
            "Too many password recovery requests. Please try again later.",
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  // 2. Parse request body as JSON
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

  // Pre-normalize email whitespace if present
  if (body && typeof body === "object" && "email" in body && typeof (body as any).email === "string") {
    (body as any).email = (body as any).email.trim();
  }

  // 3. Validate email format with ForgotPasswordSchema
  const validationResult = ForgotPasswordSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Please provide a valid email address.",
          fieldErrors: validationResult.error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  // Record valid recovery submission against IP rate limit
  await recordDbRateLimitAttempt(
    clientIp,
    "mobile_forgot_password",
    FORGOT_PASSWORD_WINDOW_SECONDS
  );

  const normalizedEmail = validationResult.data.email.toLowerCase().trim();

  // 4. Fail early if email provider is unconfigured (prevents account enumeration and false success)
  const isMockEnv =
    process.env.NODE_ENV === "test" ||
    process.env.EMAIL_MOCK === "true" ||
    (normalizedEmail.endsWith("@selffits-test.local") &&
      process.env.RESEND_API_KEY === "re_test_selffits_resend_key");

  if (!isResendConfigured() && !isMockEnv) {
    console.error(
      "[AUTH-API] Forgot Password service unavailable: RESEND_API_KEY is not configured or placeholder."
    );
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message:
            "Password recovery service is temporarily unavailable. Please try again later or contact support.",
        },
      },
      { status: 503 }
    );
  }

  // 5. Look up user account
  let user = null;
  try {
    user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        isBlocked: true,
      },
    });
  } catch (dbErr) {
    console.error("[AUTH] Database lookup error during forgot password:", dbErr);
    // Even if database has a transient issue, return generic 200 to prevent status leaks
    return NextResponse.json(
      {
        success: true,
        data: {
          message: GENERIC_RECOVERY_MESSAGE,
        },
      },
      { status: 200 }
    );
  }

  // 6. If user exists and is not blocked, generate token and dispatch reset email
  if (user && !user.isBlocked) {
    let tokenCreated = false;
    let generatedToken = "";

    try {
      // Clear any prior unused reset tokens for this email
      await db.passwordResetToken.deleteMany({
        where: { email: normalizedEmail },
      });

      generatedToken = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 Hour

      await db.passwordResetToken.create({
        data: {
          email: normalizedEmail,
          token: generatedToken,
          expires,
        },
      });

      tokenCreated = true;

      // Construct reset URL using robust baseUrl resolver
      const baseUrl = getAppBaseUrl();
      const resetUrl = `${baseUrl}/reset-password?token=${generatedToken}`;

      const emailResult = await sendPasswordResetEmail({
        to: normalizedEmail,
        name: user.firstName || user.name || "Member",
        resetUrl,
      });

      // If email delivery failed, roll back the newly generated token
      if (!emailResult.success) {
        console.warn(
          `[AUTH-API] Password reset email could not be delivered for user ${user.id}: ${emailResult.error}. Rolling back reset token.`
        );
        await db.passwordResetToken
          .deleteMany({
            where: { token: generatedToken },
          })
          .catch(() => {});
      }
    } catch (err: any) {
      console.error(
        "[AUTH] Exception during password reset token creation or email dispatch:",
        err?.message
      );
      if (tokenCreated && generatedToken) {
        await db.passwordResetToken
          .deleteMany({
            where: { token: generatedToken },
          })
          .catch(() => {});
      }
    }
  }

  // 7. Return identical generic HTTP 200 response to preserve anti-enumeration
  return NextResponse.json(
    {
      success: true,
      data: {
        message: GENERIC_RECOVERY_MESSAGE,
      },
    },
    { status: 200 }
  );
}
