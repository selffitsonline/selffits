/**
 * Cloudflare Turnstile Server-Side Verification Helper
 * Official Documentation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const CLOUDFLARE_SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Cloudflare official test keys:
// Secret: 1x0000000000000000000000000000000AA (always passes)
const DEFAULT_TEST_SECRET = "1x0000000000000000000000000000000AA";

export interface TurnstileVerifyResult {
  success: boolean;
  error?: string;
  challengeTs?: string;
  hostname?: string;
  errorCodes?: string[];
}

export async function verifyTurnstileToken(
  token?: string | null,
  remoteIp?: string
): Promise<TurnstileVerifyResult> {
  if (!token || typeof token !== "string" || token.trim() === "") {
    return {
      success: false,
      error: "Bot verification required. Please complete the security check.",
    };
  }

  const isProduction = process.env.NODE_ENV === "production";
  const configuredSecret = process.env.TURNSTILE_SECRET_KEY?.trim();

  // Fail-closed security rule in production:
  // Reject if TURNSTILE_SECRET_KEY is missing or set to the public dummy test secret
  if (isProduction) {
    if (!configuredSecret || configuredSecret === DEFAULT_TEST_SECRET) {
      console.error(
        "[TURNSTILE-SECURITY] Critical: Missing or invalid production TURNSTILE_SECRET_KEY in production environment."
      );
      return {
        success: false,
        error: "Security verification service is temporarily unavailable. Please contact support.",
      };
    }
  }

  // Official Cloudflare testing secrets:
  // 1x00...AA -> Always passes
  // 2x00...AA -> Always fails
  const ALWAYS_FAILS_TEST_SECRET = "2x0000000000000000000000000000000AA";

  let secretKey = configuredSecret || DEFAULT_TEST_SECRET;
  if (!isProduction && (!configuredSecret || configuredSecret === DEFAULT_TEST_SECRET)) {
    if (token.trim() === "2x00000000000000000000AB" || token.trim() === "cf-always-fail-test-token") {
      secretKey = ALWAYS_FAILS_TEST_SECRET;
    }
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token.trim());
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch(CLOUDFLARE_SITEVERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      // 5-second timeout for responsiveness
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error("[TURNSTILE] HTTP request error:", response.status, response.statusText);
      return {
        success: false,
        error: "Verification service currently unavailable. Please try again.",
      };
    }

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        challengeTs: data.challenge_ts,
        hostname: data.hostname,
      };
    }

    console.warn("[TURNSTILE] Token verification failed:", data["error-codes"]);
    return {
      success: false,
      error: "Bot verification failed or token has expired. Please try again.",
      errorCodes: data["error-codes"],
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[TURNSTILE] Verification network exception:", errorMsg);

    // Development only: Allow dev bypass if local network times out using test keys
    if (!isProduction && (!configuredSecret || configuredSecret === DEFAULT_TEST_SECRET)) {
      console.warn("[TURNSTILE-DEV] Allowing dev bypass due to local network timeout.");
      return { success: true };
    }

    return {
      success: false,
      error: "Security verification check timed out. Please try again.",
    };
  }
}
