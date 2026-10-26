import { db } from "@/lib/db";
import { headers } from "next/headers";

export interface RateLimitOptions {
  key?: string;
  action: "login" | "register" | "forgot_password" | "resend_verification" | "reset_password";
  maxAttempts: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining?: number;
  retryAfterSeconds?: number;
  error?: string;
}

/**
 * Extracts a client identifier from headers (forwarded IP or user agent fallback).
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = headerList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
    const cfConnectingIp = headerList.get("cf-connecting-ip");
    if (cfConnectingIp) {
      return cfConnectingIp.trim();
    }
  } catch {
    // If called outside of request context
  }
  return "127.0.0.1";
}

/**
 * Database-backed rate limiter that persists across serverless/distributed instances.
 */
export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { action, maxAttempts, windowSeconds } = options;
  const ip = await getClientIp();
  const targetKey = options.key ? `${options.key.toLowerCase().trim()}_${ip}` : ip;

  const now = new Date();

  try {
    // Clean up expired records asynchronously for this key & action
    db.rateLimitRecord
      .deleteMany({
        where: {
          key: targetKey,
          action,
          expiresAt: { lt: now },
        },
      })
      .catch((err) => {
        // Non-blocking cleanup error
        console.warn("[RATE_LIMIT] Cleanup warn:", err?.message);
      });

    // Count existing active points
    const activeRecords = await db.rateLimitRecord.findMany({
      where: {
        key: targetKey,
        action,
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: "desc" },
    });

    const currentPoints = activeRecords.reduce((sum, rec) => sum + rec.points, 0);

    if (currentPoints >= maxAttempts) {
      const earliestExpiry = activeRecords[0]?.expiresAt || new Date(now.getTime() + windowSeconds * 1000);
      const retryAfterSeconds = Math.max(1, Math.ceil((earliestExpiry.getTime() - now.getTime()) / 1000));

      let actionDesc = "attempts";
      if (action === "login") actionDesc = "login attempts";
      else if (action === "register") actionDesc = "registration attempts";
      else if (action === "forgot_password") actionDesc = "password recovery requests";
      else if (action === "resend_verification") actionDesc = "verification email requests";
      else if (action === "reset_password") actionDesc = "password reset attempts";

      return {
        success: false,
        retryAfterSeconds,
        error: `Too many ${actionDesc}. Please try again in ${retryAfterSeconds} second${
          retryAfterSeconds > 1 ? "s" : ""
        }.`,
      };
    }

    // Record new attempt
    await db.rateLimitRecord.create({
      data: {
        key: targetKey,
        action,
        points: 1,
        expiresAt: new Date(now.getTime() + windowSeconds * 1000),
      },
    });

    return {
      success: true,
      remaining: Math.max(0, maxAttempts - currentPoints - 1),
    };
  } catch (err) {
    console.error("[RATE_LIMIT] Database check error:", err);
    // Fail-open in dev/error so users aren't locked out due to DB transient hiccups
    return { success: true, remaining: 1 };
  }
}
