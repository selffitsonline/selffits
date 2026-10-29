import { Resend } from "resend";
import { renderResetPasswordEmailHtml } from "@/emails/reset-password.email";

export const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_key");
export const EMAIL_FROM = process.env.EMAIL_FROM || "SELFFITS Academy <onboarding@resend.dev>";

/**
 * Validates whether an authentic, operational Resend API key is configured.
 * Safely excludes missing values, unconfigured placeholders, and test dummies in production.
 */
export function isResendConfigured(): boolean {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return false;
  if (key === "re_placeholder_key") return false;
  if (key === "re_test_selffits_resend_key" && process.env.NODE_ENV !== "test") return false;
  return key.startsWith("re_") && key.length > 20;
}

/**
 * Authoritative Application Base URL Resolver.
 * Correctly resolves the frontend URL for password reset links and email actions across:
 * 1. Explicit NEXT_PUBLIC_APP_URL overrides (recommended for staging)
 * 2. Explicit NEXTAUTH_URL (when configured with a non-localhost domain)
 * 3. Vercel Preview / Staging deployments (using VERCEL_URL so reset links NEVER point to production)
 * 4. Vercel Production deployments (using VERCEL_PROJECT_PRODUCTION_URL or selffits.com)
 * 5. Localhost development fallback
 */
export function getAppBaseUrl(): string {
  // 1. Explicitly configured public app URL (ideal for staging or custom subdomains)
  if (process.env.NEXT_PUBLIC_APP_URL?.trim()) {
    return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, "");
  }

  // 2. Explicitly configured NEXTAUTH_URL (if not localhost)
  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim();
  if (nextAuthUrl && !nextAuthUrl.includes("localhost")) {
    return nextAuthUrl.replace(/\/$/, "");
  }

  // 3. Vercel Preview / Staging deployment: use the preview deployment URL
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim()}`.replace(/\/$/, "");
  }

  // 4. Vercel Production deployment
  if (process.env.VERCEL_ENV === "production") {
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`.replace(/\/$/, "");
    }
    return "https://selffits.com";
  }

  // 5. General VERCEL_URL fallback
  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim()}`.replace(/\/$/, "");
  }

  // 6. Local development fallback
  return nextAuthUrl || "http://localhost:3000";
}

/**
 * In-memory test mailbox storage for isolated unit tests, CI test runners, and mock verification.
 */
export interface MockSentEmail {
  to: string;
  subject: string;
  resetUrl: string;
  sentAt: Date;
}

const mockSentEmails: MockSentEmail[] = [];

export function getMockSentEmails(): MockSentEmail[] {
  return [...mockSentEmails];
}

export function clearMockSentEmails(): void {
  mockSentEmails.length = 0;
}

export interface SendResetEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

/**
 * Centralized, safe password reset email dispatcher.
 * Handles both live Resend HTTP API delivery and test sandbox simulation.
 * Ensures reset tokens and sensitive credentials are never leaked in log outputs.
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  resetUrl: string;
}): Promise<SendResetEmailResult> {
  const { to, name, resetUrl } = params;
  const normalizedTo = to.toLowerCase().trim();

  // Test / Sandbox Simulation Mode:
  const isTestMockMode =
    process.env.NODE_ENV === "test" ||
    process.env.EMAIL_MOCK === "true" ||
    (normalizedTo.endsWith("@selffits-test.local") &&
      process.env.RESEND_API_KEY === "re_test_selffits_resend_key");

  if (isTestMockMode) {
    mockSentEmails.push({
      to: normalizedTo,
      subject: "Reset Your SELFFITS Account Password",
      resetUrl,
      sentAt: new Date(),
    });
    return {
      success: true,
      messageId: `mock_email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      simulated: true,
    };
  }

  // Live Resend Provider Check
  if (!isResendConfigured()) {
    return {
      success: false,
      error: "EMAIL_PROVIDER_UNCONFIGURED: Missing or placeholder RESEND_API_KEY",
    };
  }

  try {
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: normalizedTo,
      subject: "Reset Your SELFFITS Account Password",
      html: renderResetPasswordEmailHtml(name, resetUrl),
    });

    if (resendError) {
      console.error("[AUTH] Resend rejected reset password email:", resendError.message);
      return {
        success: false,
        error: resendError.message,
      };
    }

    if (!resendData?.id) {
      console.error("[AUTH] Resend did not return a message ID for reset password email");
      return {
        success: false,
        error: "Resend response missing message ID",
      };
    }

    return {
      success: true,
      messageId: resendData.id,
      simulated: false,
    };
  } catch (err: any) {
    console.error("[AUTH] Exception during Resend email dispatch:", err?.message || err);
    return {
      success: false,
      error: err?.message || "Failed to dispatch email via Resend",
    };
  }
}
