import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { renderWelcomeVerificationEmailHtml } from "@/emails/welcome-verification.email";
import { ProgramRegistrationSchema } from "@/types/validation.schemas";
import { ApiResponse, MobileRegisterResponseDto } from "@/types/mobile-api.dto";

export const dynamic = "force-dynamic";

/**
 * =============================================================================
 * SELFFITS Mobile Registration API — Security & Abuse Controls Architecture
 * =============================================================================
 *
 * 1. TURNSTILE CAPTCHA DEVIATION & NATIVE MOBILE ABUSE THREAT MODEL:
 *    - Cloudflare Turnstile CAPTCHA protects the website registration flow via
 *      a browser-rendered JS challenge.
 *    - The native Flutter mobile application operates without an embedded web
 *      runtime; Turnstile is therefore NOT directly available on native screens.
 *    - COMPENSATING CONTROLS:
 *      a) Multi-tiered database-backed rate limiting per client IP:
 *         - Maximum 3 successful registrations per 15-minute sliding window.
 *         - Maximum 10 failed registration attempts per 10-minute sliding window.
 *      b) Trusted IP provenance extraction prioritizing edge proxy headers
 *         (cf-connecting-ip, x-real-ip) over arbitrary client-supplied headers.
 *      c) Mandatory email verification: newly registered accounts remain unverified
 *         (emailVerified: null) and are barred from accessing authenticated student
 *         sessions until verified with a single-use cryptographically secure token.
 *      d) Strict role isolation: the account role is hardcoded to Role.STUDENT.
 *         Client attempts to submit role: "COACH" or "ADMIN" are discarded.
 *      e) Single-transaction atomicity: User and StudentProfile are created together,
 *         preventing orphan or half-initialized accounts.
 *
 * 2. REMAINING ABUSE RISKS:
 *    - Without client-side proof-of-work/CAPTCHA, automated bots utilizing rotating
 *      residential proxy pools could potentially exhaust Resend email credits or
 *      create unverified student records.
 *    - Recommended future enhancement: Native device attestation (Apple DeviceCheck /
 *      Google Play Integrity API) or SMS/OTP step before transactional email send.
 * =============================================================================
 */

// Rate Limiting Configurations
const MAX_SUCCESSFUL_REGISTRATIONS = 3;
const SUCCESS_REGISTRATION_WINDOW_SECONDS = 15 * 60; // 15 minutes (900s)

const MAX_FAILED_REGISTRATIONS = 10;
const FAILED_REGISTRATION_WINDOW_SECONDS = 10 * 60; // 10 minutes (600s)

/**
 * Extracts a trustworthy client IP address from proxy headers.
 * Prioritizes headers injected by trusted reverse proxies (Cloudflare, Nginx)
 * over arbitrary client-manipulable forwarded headers.
 */
export function getTrustedClientIp(req: Request): string {
  // 1. Cloudflare connecting IP (authoritative when deployed behind Cloudflare)
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp && cfIp.trim().length > 0) {
    return cfIp.trim();
  }

  // 2. Nginx / reverse proxy authenticated real client IP
  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim().length > 0) {
    return realIp.trim();
  }

  // 3. Fall back to the first entry of x-forwarded-for
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded && forwarded.trim().length > 0) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp.length > 0) {
      return firstIp;
    }
  }

  // 4. Conservative fallback when no proxy header is trustworthy/present
  return "127.0.0.1";
}

/**
 * Database-backed rate limit check for persistent enforcement across serverless instances.
 */
async function checkDbRateLimit(
  key: string,
  action: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfterSeconds: number; error?: string }> {
  const now = new Date();

  try {
    // Non-blocking cleanup of expired records for this key/action
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

    // Count active points in current window
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
        error: `Too many registration requests from this IP. Please try again in ${retryAfterSeconds} seconds.`,
      };
    }

    return { allowed: true, retryAfterSeconds: 0 };
  } catch (err) {
    console.error("[RATE_LIMIT] Database check error:", err);
    // Fail open on database connection error to prevent total denial of service
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

/**
 * Records an attempt point in the database rate limit table.
 */
async function recordDbRateLimitAttempt(
  key: string,
  action: string,
  windowSeconds: number,
  points: number = 1
): Promise<void> {
  const now = new Date();
  try {
    await db.rateLimitRecord.create({
      data: {
        key,
        action,
        points,
        expiresAt: new Date(now.getTime() + windowSeconds * 1000),
      },
    });
  } catch (err) {
    console.error("[RATE_LIMIT] Database record error:", err);
  }
}

export async function POST(
  req: Request
): Promise<NextResponse<ApiResponse<MobileRegisterResponseDto>>> {
  const clientIp = getTrustedClientIp(req);

  // 1. Check failed registration attempt rate limit (max 10 per 10 minutes)
  const failedLimit = await checkDbRateLimit(
    clientIp,
    "mobile_register_failed",
    MAX_FAILED_REGISTRATIONS,
    FAILED_REGISTRATION_WINDOW_SECONDS
  );

  if (!failedLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "TOO_MANY_ATTEMPTS",
          message:
            failedLimit.error ||
            "Too many failed registration attempts. Please try again later.",
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(failedLimit.retryAfterSeconds),
        },
      }
    );
  }

  // 2. Check successful registration rate limit (max 3 per 15 minutes)
  const successLimit = await checkDbRateLimit(
    clientIp,
    "mobile_register",
    MAX_SUCCESSFUL_REGISTRATIONS,
    SUCCESS_REGISTRATION_WINDOW_SECONDS
  );

  if (!successLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "TOO_MANY_ATTEMPTS",
          message:
            successLimit.error ||
            "Registration limit reached for this IP. Please try again later.",
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(successLimit.retryAfterSeconds),
        },
      }
    );
  }

  // 3. Parse and validate JSON payload
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    await recordDbRateLimitAttempt(
      clientIp,
      "mobile_register_failed",
      FAILED_REGISTRATION_WINDOW_SECONDS
    );
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

  const validationResult = ProgramRegistrationSchema.safeParse(body);
  if (!validationResult.success) {
    await recordDbRateLimitAttempt(
      clientIp,
      "mobile_register_failed",
      FAILED_REGISTRATION_WINDOW_SECONDS
    );
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Please complete all required questionnaire fields.",
          fieldErrors: validationResult.error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  const data = validationResult.data;

  // 4. Extract and normalize input fields
  const email = data.email.toLowerCase().trim();
  const fullName = data.fullName.trim();
  const nameParts = fullName.split(" ").filter(Boolean);
  const firstName = nameParts[0] || fullName;
  const lastName = nameParts.slice(1).join(" ") || "";
  const phone = data.phone.trim();
  const country = data.country || "India";

  // Program questionnaire fields
  let registeredProgram: string;
  let studentType: string | undefined = undefined;
  let martialArtsLevel: string | undefined = undefined;
  let trainingGoal: string | undefined = undefined;
  let currentWeightKg: number | undefined = undefined;
  let targetWeightKg: number | undefined = undefined;
  let fitnessGoal: string | undefined = undefined;
  let fitnessLevel: string | undefined = undefined;
  let workoutFrequency: string | undefined = undefined;
  let questionnaireAnswers: Record<string, any> = {};

  if (data.registeredProgram === "WEIGHT_MANAGEMENT_FITNESS") {
    registeredProgram = "WEIGHT_MANAGEMENT_FITNESS";
    studentType = data.ageGroup;
    currentWeightKg = data.currentWeightKg;
    targetWeightKg = data.targetWeightKg;
    fitnessGoal = data.fitnessGoal;
    fitnessLevel = data.fitnessLevel;
    workoutFrequency = data.workoutFrequency;
    questionnaireAnswers = {
      ageGroup: data.ageGroup,
      currentWeightKg: data.currentWeightKg,
      targetWeightKg: data.targetWeightKg,
      fitnessGoal: data.fitnessGoal,
      fitnessLevel: data.fitnessLevel,
      workoutFrequency: data.workoutFrequency,
    };
  } else {
    // MARTIAL_ARTS
    registeredProgram = "MARTIAL_ARTS";
    studentType = data.studentType;
    martialArtsLevel = data.martialArtsLevel;
    trainingGoal = data.trainingGoal;
    currentWeightKg = data.currentWeightKg;
    questionnaireAnswers = {
      studentType: data.studentType,
      martialArtsLevel: data.martialArtsLevel,
      trainingGoal: data.trainingGoal,
      currentWeightKg: data.currentWeightKg,
    };
  }

  // 5. Check for existing user account with this email
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    await recordDbRateLimitAttempt(
      clientIp,
      "mobile_register_failed",
      FAILED_REGISTRATION_WINDOW_SECONDS
    );
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DUPLICATE_EMAIL",
          message:
            "An account with this email address already exists. Please log in or reset your password.",
          fieldErrors: { email: ["Email address is already registered"] },
        },
      },
      { status: 409 }
    );
  }

  // 6. Hash password with bcrypt (10 rounds)
  const passwordHash = await bcrypt.hash(data.password, 10);

  // 7. Atomically create User and StudentProfile in single database transaction
  let newUser: { id: string; email: string; name: string };
  try {
    newUser = await db.$transaction(async (tx) => {
      // SECURITY RULE: Always assign Role.STUDENT.
      // Never accept or trust a client-provided role.
      // emailVerified MUST be null upon registration.
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          name: fullName,
          email,
          passwordHash,
          role: Role.STUDENT,
          emailVerified: null,
          isBlocked: false,
        },
      });

      await tx.studentProfile.create({
        data: {
          userId: user.id,
          phone,
          country,
          registeredProgram,
          studentType,
          martialArtsLevel,
          trainingGoal,
          currentWeightKg,
          targetWeightKg,
          fitnessGoal,
          fitnessLevel,
          workoutFrequency,
          questionnaireAnswers,
        },
      });

      return user;
    });
  } catch (txErr: any) {
    // Handle Prisma P2002 race condition on unique email constraint
    if (txErr?.code === "P2002") {
      await recordDbRateLimitAttempt(
        clientIp,
        "mobile_register_failed",
        FAILED_REGISTRATION_WINDOW_SECONDS
      );
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_EMAIL",
            message:
              "An account with this email address already exists. Please log in or reset your password.",
            fieldErrors: { email: ["Email address is already registered"] },
          },
        },
        { status: 409 }
      );
    }

    console.error("[MOBILE_REGISTER] Account creation transaction failed:", txErr?.message);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ACCOUNT_CREATION_FAILED",
          message: "Unable to create account at this time. Please try again later.",
        },
      },
      { status: 500 }
    );
  }

  // Record successful registration for IP rate limiting
  await recordDbRateLimitAttempt(
    clientIp,
    "mobile_register",
    SUCCESS_REGISTRATION_WINDOW_SECONDS
  );

  // 8. Generate single-use 24-hour verification token & dispatch welcome email
  let emailDelivered = false;
  let emailDeliveryWarning: string | undefined = undefined;

  try {
    // Clear any previous verification tokens for this email
    await db.verificationToken.deleteMany({ where: { email } });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

    await db.verificationToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Derive authoritative application base URL
    const configuredUrl = process.env.NEXTAUTH_URL?.trim();
    const baseUrl =
      configuredUrl && !configuredUrl.includes("localhost")
        ? configuredUrl
        : process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.NODE_ENV === "production"
        ? "https://selffits.com"
        : configuredUrl ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const verificationUrl = `${baseUrl.replace(/\/$/, "")}/verify-email?token=${token}`;

    const isTestMockAccount =
      email.endsWith("@selffits-test.local") &&
      process.env.RESEND_API_KEY === "re_test_selffits_resend_key";

    if (isTestMockAccount) {
      emailDelivered = true;
    } else {
      const { data: resendData, error: resendError } = await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: "Verify Your SELFFITS Academy Account",
        html: renderWelcomeVerificationEmailHtml(firstName, verificationUrl),
      });

      if (resendError) {
        console.error(
          "[AUTH] Resend verification email delivery error:",
          resendError.message
        );
        emailDeliveryWarning =
          "Account created, but verification email dispatch encountered a temporary delay. You can request a replacement verification link from the login screen.";
      } else if (resendData?.id) {
        emailDelivered = true;
      }
    }
  } catch (deliveryErr: any) {
    console.error(
      "[AUTH] Verification token creation or email dispatch exception:",
      deliveryErr?.message
    );
    emailDeliveryWarning =
      "Account created, but verification email dispatch encountered a temporary delay. You can request a replacement verification link from the login screen.";
  }

  // 9. Return HTTP 201 Created with standard API envelope
  const responseData: MobileRegisterResponseDto = {
    userId: newUser.id,
    email: newUser.email,
    fullName: newUser.name,
    registeredProgram,
    emailVerificationRequired: true,
    message: emailDelivered
      ? "Registration successful! Please check your email to verify your account."
      : "Registration successful! Account created, but email dispatch was delayed. Please use 'Resend Verification' on the login screen if needed.",
    ...(emailDeliveryWarning ? { emailDeliveryWarning } : {}),
  };

  return NextResponse.json(
    {
      success: true,
      data: responseData,
    },
    { status: 201 }
  );
}
