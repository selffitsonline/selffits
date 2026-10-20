import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import {
  signMobileToken,
  MOBILE_TOKEN_EXPIRATION_SECONDS,
} from "@/lib/mobile-auth";
import {
  MobileLoginSchema,
  ApiResponse,
  MobileLoginResponseDto,
} from "@/types/mobile-api.dto";

export const dynamic = "force-dynamic";

interface FailedAttemptRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil?: number;
}

// In-memory sliding window rate limiter: 5 failed attempts per 15 minutes per IP.
// Operational Limitation: On Vercel serverless runtime, this in-memory Map provides best-effort
// protection per warm instance. Distributed attacks across distinct cold instances are not
// globally synchronized; global coordination would require centralized state (e.g. Upstash Redis).
const failedAttemptsMap = new Map<string, FailedAttemptRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown-client";
}

function checkRateLimit(key: string): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = failedAttemptsMap.get(key);

  if (!record) {
    return { limited: false, retryAfterSeconds: 0 };
  }

  // Active lockout check
  if (record.lockedUntil && record.lockedUntil > now) {
    const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
    return { limited: true, retryAfterSeconds: retryAfter };
  }

  // Window expiry cleanup
  if (now - record.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    failedAttemptsMap.delete(key);
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    const retryAfter = Math.ceil(LOCKOUT_DURATION_MS / 1000);
    return { limited: true, retryAfterSeconds: retryAfter };
  }

  return { limited: false, retryAfterSeconds: 0 };
}

function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = failedAttemptsMap.get(key);

  if (!record || now - record.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    failedAttemptsMap.set(key, { attempts: 1, firstAttemptAt: now });
  } else {
    record.attempts += 1;
    if (record.attempts >= MAX_FAILED_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_DURATION_MS;
    }
  }
}

function clearRateLimit(key: string): void {
  failedAttemptsMap.delete(key);
}

export async function POST(req: Request): Promise<NextResponse<ApiResponse<MobileLoginResponseDto>>> {
  const clientKey = getClientIdentifier(req);
  const rateLimit = checkRateLimit(clientKey);

  if (rateLimit.limited) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "TOO_MANY_ATTEMPTS",
          message: `Too many failed login attempts. Please try again in ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minutes.`,
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

    const validationResult = MobileLoginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid login credentials format.",
            fieldErrors: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    let user = null;
    try {
      user = await db.user.findUnique({
        where: { email },
      });
    } catch (dbErr) {
      console.warn("Database lookup failed during mobile login:", dbErr);
    }

    if (user) {
      if (user.isBlocked) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "ACCOUNT_BLOCKED",
              message:
                "Your account has been blocked by an administrator. Please contact academy support.",
            },
          },
          { status: 403 }
        );
      }

      if (user.passwordHash) {
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (isPasswordValid) {
          let resolvedRole = user.role;

          // If user is marked as STUDENT but has an approved Coach profile, resolve as COACH (matches web lib/auth.ts)
          if (resolvedRole === "STUDENT") {
            try {
              const coachProfile = await db.coachApplication.findFirst({
                where: { email: { equals: user.email, mode: "insensitive" }, status: "APPROVED" },
              });
              if (coachProfile) {
                resolvedRole = Role.COACH;
              }
            } catch {
              // Ignore lookup errors
            }
          }

          const token = await signMobileToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: resolvedRole,
            isBlocked: user.isBlocked,
          });

          clearRateLimit(clientKey);

          return NextResponse.json(
            {
              success: true,
              data: {
                accessToken: token,
                tokenType: "Bearer",
                expiresIn: MOBILE_TOKEN_EXPIRATION_SECONDS,
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: resolvedRole,
                  isBlocked: user.isBlocked,
                  image: user.image || null,
                },
              },
            },
            { status: 200 }
          );
        }
      }
    }

    // Demo / Fallback Login accounts (strictly for local development, disabled in production)
    if (process.env.NODE_ENV !== "production") {
      if (email === "coach@selffits.com" && (password === "password" || password === "Coach@123" || password === "password123")) {
        const demoUser = {
          id: "cmt9sqe230001ckkg5rpuxvrc",
          email: "sujithcjohn@gmail.com",
          name: "Sujith John",
          role: Role.COACH,
          isBlocked: false,
        };

        const token = await signMobileToken(demoUser);
        clearRateLimit(clientKey);

        return NextResponse.json(
          {
            success: true,
            data: {
              accessToken: token,
              tokenType: "Bearer",
              expiresIn: MOBILE_TOKEN_EXPIRATION_SECONDS,
              user: {
                ...demoUser,
                image: null,
              },
            },
          },
          { status: 200 }
        );
      }

      if ((email === "student@selffits.com" || email === "demo@selffits.com") && (password === "password" || password === "Student@123" || password === "password123")) {
        const demoUser = {
          id: "demo-student-user-id",
          email: email,
          name: "Demo Student",
          role: Role.STUDENT,
          isBlocked: false,
        };

        const token = await signMobileToken(demoUser);
        clearRateLimit(clientKey);

        return NextResponse.json(
          {
            success: true,
            data: {
              accessToken: token,
              tokenType: "Bearer",
              expiresIn: MOBILE_TOKEN_EXPIRATION_SECONDS,
              user: {
                ...demoUser,
                image: null,
              },
            },
          },
          { status: 200 }
        );
      }
    }

    // Record failed attempt for rate limiting
    recordFailedAttempt(clientKey);

    // Generic safe error response - never disclose if email exists
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        },
      },
      { status: 401 }
    );
  } catch (err: any) {
    console.error("Mobile API Login Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected authentication error occurred. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
