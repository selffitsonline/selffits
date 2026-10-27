"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { resend, EMAIL_FROM } from "@/lib/resend";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  RegisterSchema,
  MartialArtsRegistrationSchema,
  WeightFitnessRegistrationSchema,
  ProgramRegistrationSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ResendVerificationSchema,
  RegisterInput,
  MartialArtsRegistrationInput,
  WeightFitnessRegistrationInput,
  ProgramRegistrationInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ResendVerificationInput,
} from "@/types/validation.schemas";
import { validatePhoneNumberForCountry } from "@/lib/countries";
import { WelcomeVerificationEmail, renderWelcomeVerificationEmailHtml } from "@/emails/welcome-verification.email";
import { ResetPasswordEmail, renderResetPasswordEmailHtml } from "@/emails/reset-password.email";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export type AuthActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  rateLimited?: boolean;
};

/**
 * Validates login pre-checks (Rate Limiting & Cloudflare Turnstile CAPTCHA)
 */
export async function preLoginCheckAction(
  email: string,
  turnstileToken?: string
): Promise<AuthActionResult> {
  const clientIp = await getClientIp();

  // 1. Rate Limiting Check (max 10 attempts per 5 minutes per IP/email)
  const rateLimit = await checkRateLimit({
    key: email || clientIp,
    action: "login",
    maxAttempts: 10,
    windowSeconds: 300,
  });

  if (!rateLimit.success) {
    return {
      success: false,
      error: rateLimit.error || "Too many login attempts. Please wait before trying again.",
      rateLimited: true,
    };
  }

  // 2. Cloudflare Turnstile Verification
  const turnstile = await verifyTurnstileToken(turnstileToken, clientIp);
  if (!turnstile.success) {
    return {
      success: false,
      error: turnstile.error || "Security verification failed. Please try again.",
    };
  }

  return { success: true };
}

/**
 * Registers a student with either Martial Arts or Weight Management questionnaire.
 * Also supports legacy registration inputs for full backward compatibility.
 */
export async function registerStudentAction(
  data: ProgramRegistrationInput | RegisterInput | any
): Promise<AuthActionResult> {
  try {
    const clientIp = await getClientIp();

    // 1. Rate Limiting (max 5 registration attempts per 5 minutes per IP)
    const rateLimit = await checkRateLimit({
      key: clientIp,
      action: "register",
      maxAttempts: 5,
      windowSeconds: 300,
    });

    if (!rateLimit.success) {
      return {
        success: false,
        error: rateLimit.error || "Too many registration attempts. Please wait a few minutes.",
        rateLimited: true,
      };
    }

    // 2. Turnstile Verification
    const turnstileToken = data?.turnstileToken;
    const turnstile = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstile.success) {
      return {
        success: false,
        error: turnstile.error || "Bot verification failed. Please complete the security check.",
      };
    }

    // 3. Schema Parsing based on registered program or legacy form
    let fullName = "";
    let email = "";
    let phone = "";
    let country = "India";
    let password = "";
    let registeredProgram = "MARTIAL_ARTS";
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
      const parsed = WeightFitnessRegistrationSchema.safeParse(data);
      if (!parsed.success) {
        return {
          success: false,
          error: "Please complete all required fitness questionnaire fields.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      }
      const val = parsed.data;
      fullName = val.fullName.trim();
      email = val.email.toLowerCase().trim();
      phone = val.phone.trim();
      country = val.country || "India";
      password = val.password;
      registeredProgram = "WEIGHT_MANAGEMENT_FITNESS";
      studentType = val.ageGroup;
      currentWeightKg = val.currentWeightKg;
      targetWeightKg = val.targetWeightKg;
      fitnessGoal = val.fitnessGoal;
      fitnessLevel = val.fitnessLevel;
      workoutFrequency = val.workoutFrequency;
      questionnaireAnswers = {
        ageGroup: val.ageGroup,
        currentWeightKg: val.currentWeightKg,
        targetWeightKg: val.targetWeightKg,
        fitnessGoal: val.fitnessGoal,
        fitnessLevel: val.fitnessLevel,
        workoutFrequency: val.workoutFrequency,
      };
    } else if (data.registeredProgram === "MARTIAL_ARTS" || ("martialArtsLevel" in data && !("firstName" in data))) {
      const parsed = MartialArtsRegistrationSchema.safeParse(data);
      if (!parsed.success) {
        return {
          success: false,
          error: "Please complete all required martial arts questionnaire fields.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      }
      const val = parsed.data;
      fullName = val.fullName.trim();
      email = val.email.toLowerCase().trim();
      phone = val.phone.trim();
      country = val.country || "India";
      password = val.password;
      registeredProgram = "MARTIAL_ARTS";
      studentType = val.studentType;
      martialArtsLevel = val.martialArtsLevel;
      trainingGoal = val.trainingGoal;
      currentWeightKg = val.currentWeightKg;
      questionnaireAnswers = {
        studentType: val.studentType,
        martialArtsLevel: val.martialArtsLevel,
        trainingGoal: val.trainingGoal,
        currentWeightKg: val.currentWeightKg,
      };
    } else {
      // Legacy Registration input
      const parsed = RegisterSchema.safeParse(data);
      if (!parsed.success) {
        return {
          success: false,
          error: "Validation failed. Please check form errors.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      }
      const val = parsed.data;
      fullName = `${val.firstName.trim()} ${val.lastName.trim()}`;
      email = val.email.toLowerCase().trim();
      phone = val.phone.trim();
      country = val.country;
      password = val.password;
      registeredProgram = "MARTIAL_ARTS";
      studentType = val.age < 18 ? "Child (under 18)" : "Adult (18+)";
      questionnaireAnswers = {
        age: val.age,
        gender: val.gender,
      };
    }

    // Split name into first and last name for storage
    const nameParts = fullName.split(" ").filter(Boolean);
    const firstName = nameParts[0] || fullName;
    const lastName = nameParts.slice(1).join(" ") || "";

    // 4. Check for existing accounts
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email address already exists. Please log in or reset your password.",
        fieldErrors: { email: ["Email address is already registered"] },
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Create user and student profile (Mandatory: emailVerified remains NULL)
    const newUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          name: fullName,
          email,
          passwordHash,
          role: "STUDENT",
          emailVerified: null, // Compulsory: Must NOT be verified upon registration
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

    // 6. Generate secure single-use 24-hour verification token & send email
    try {
      // Clear any prior verification tokens for this email
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

      const baseUrl =
        process.env.NEXTAUTH_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
      const verificationUrl = `${baseUrl.replace(/\/$/, "")}/verify-email?token=${token}`;

      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: "Verify Your SELFFITS Academy Account",
        html: renderWelcomeVerificationEmailHtml(firstName, verificationUrl),
      });
    } catch (emailErr) {
      console.error("[AUTH] Verification email delivery error:", emailErr);
      // We still complete registration, but notify that email dispatch failed
      return {
        success: true,
        message:
          "Account registered! However, email dispatch encountered a temporary delay. You can use 'Resend Verification' on the login page.",
      };
    }

    return {
      success: true,
      message:
        "Registration successful! We have sent a verification email to your inbox. Please verify your email before logging in.",
    };
  } catch (err: any) {
    console.error("[AUTH] registerStudentAction error:", err);
    if (err?.code === "P2002") {
      return {
        success: false,
        error: "An account with this email address already exists.",
        fieldErrors: { email: ["Email address is already registered"] },
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred during registration. Please try again.",
    };
  }
}

/**
 * Verifies email using a cryptographically secure single-use token.
 */
export async function verifyEmailAction(token: string): Promise<AuthActionResult> {
  try {
    if (!token || typeof token !== "string" || token.trim() === "") {
      return { success: false, error: "Invalid verification link. Token is missing." };
    }

    const cleanToken = token.trim();

    const verificationRecord = await db.verificationToken.findUnique({
      where: { token: cleanToken },
    });

    if (!verificationRecord) {
      return {
        success: false,
        error: "Invalid or already used verification link. If your account is not verified, please request a new link.",
      };
    }

    if (verificationRecord.expires < new Date()) {
      await db.verificationToken.delete({ where: { token: cleanToken } }).catch(() => {});
      return {
        success: false,
        error: "This verification link has expired. Please request a new verification email from the login page.",
      };
    }

    // Atomic update & single-use token invalidation
    await db.$transaction([
      db.user.update({
        where: { email: verificationRecord.email },
        data: { emailVerified: new Date() },
      }),
      db.verificationToken.delete({
        where: { token: cleanToken },
      }),
    ]);

    return {
      success: true,
      message: "Your email address has been verified successfully! You can now log in.",
    };
  } catch (err) {
    console.error("[AUTH] verifyEmailAction error:", err);
    return { success: false, error: "Failed to verify email. Please try again or request a new link." };
  }
}

/**
 * Resends a verification email with Turnstile CAPTCHA and Rate Limiting.
 */
export async function resendVerificationEmailAction(
  data: ResendVerificationInput
): Promise<AuthActionResult> {
  try {
    const clientIp = await getClientIp();

    // 1. Rate Limiting (max 3 resends per 5 minutes per IP/email)
    const normalizedEmail = data.email?.toLowerCase().trim();
    const rateLimit = await checkRateLimit({
      key: normalizedEmail || clientIp,
      action: "resend_verification",
      maxAttempts: 3,
      windowSeconds: 300,
    });

    if (!rateLimit.success) {
      return {
        success: false,
        error: rateLimit.error || "Too many verification requests. Please wait a few minutes.",
        rateLimited: true,
      };
    }

    // 2. Turnstile Verification
    const turnstile = await verifyTurnstileToken(data.turnstileToken, clientIp);
    if (!turnstile.success) {
      return {
        success: false,
        error: turnstile.error || "Security verification failed. Please try again.",
      };
    }

    const parsed = ResendVerificationSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Please provide a valid email address." };
    }

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Prevent account enumeration: return uniform success response
    if (!user) {
      return {
        success: true,
        message: "If an account with that email exists and requires verification, a new link has been sent.",
      };
    }

    if (user.emailVerified) {
      return {
        success: true,
        message: "This email address is already verified. You can log in directly.",
      };
    }

    // Delete existing tokens
    await db.verificationToken.deleteMany({
      where: { email: normalizedEmail },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

    await db.verificationToken.create({
      data: {
        email: normalizedEmail,
        token,
        expires,
      },
    });

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const verificationUrl = `${baseUrl.replace(/\/$/, "")}/verify-email?token=${token}`;

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: normalizedEmail,
        subject: "Verify Your SELFFITS Academy Account",
        html: renderWelcomeVerificationEmailHtml(
          user.firstName || user.name || "Student",
          verificationUrl
        ),
      });
    } catch (emailErr) {
      console.error("[AUTH] Resend verification email failed:", emailErr);
      return {
        success: false,
        error: "Failed to dispatch verification email. Please try again later.",
      };
    }

    return {
      success: true,
      message: "A new verification link has been sent to your email address.",
    };
  } catch (err) {
    console.error("[AUTH] resendVerificationEmailAction error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Initiates Forgot Password recovery with Turnstile CAPTCHA and Rate Limiting.
 */
export async function forgotPasswordAction(
  data: ForgotPasswordInput
): Promise<AuthActionResult> {
  try {
    const clientIp = await getClientIp();

    const normalizedEmail = data.email?.toLowerCase().trim();

    // 1. Rate Limiting (max 5 requests per 5 minutes)
    const rateLimit = await checkRateLimit({
      key: normalizedEmail || clientIp,
      action: "forgot_password",
      maxAttempts: 5,
      windowSeconds: 300,
    });

    if (!rateLimit.success) {
      return {
        success: false,
        error: rateLimit.error || "Too many password recovery requests. Please wait.",
        rateLimited: true,
      };
    }

    // 2. Turnstile Verification
    const turnstile = await verifyTurnstileToken(data.turnstileToken, clientIp);
    if (!turnstile.success) {
      return {
        success: false,
        error: turnstile.error || "Security verification failed. Please try again.",
      };
    }

    const validated = ForgotPasswordSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: "Invalid email address",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    // Fail early if email provider is unconfigured
    const isApiKeyMissingOrPlaceholder =
      !process.env.RESEND_API_KEY ||
      process.env.RESEND_API_KEY === "re_placeholder_key";

    if (isApiKeyMissingOrPlaceholder) {
      console.error(
        "[AUTH] Forgot Password service unavailable: RESEND_API_KEY is not configured or placeholder."
      );
      return {
        success: false,
        error:
          "Unable to process password recovery request at this time. Please try again later or contact support.",
      };
    }

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      await db.passwordResetToken.deleteMany({
        where: { email: normalizedEmail },
      });

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 Hour

      await db.passwordResetToken.create({
        data: {
          email: normalizedEmail,
          token,
          expires,
        },
      });

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

      const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${token}`;

      let emailSent = false;
      const isTestMockAccount =
        normalizedEmail.endsWith("@selffits-test.local") &&
        process.env.RESEND_API_KEY === "re_test_selffits_resend_key";

      if (isTestMockAccount) {
        // In local test suite with mock test domain and placeholder keys, simulate email dispatch
        emailSent = true;
        console.log(`[AUTH-TEST] Simulated password reset email for test domain: ${normalizedEmail}`);
      } else {
        try {
          const { data: resendData, error: resendError } = await resend.emails.send({
            from: EMAIL_FROM,
            to: normalizedEmail,
            subject: "Reset Your SELFFITS Account Password",
            html: renderResetPasswordEmailHtml(user.firstName || user.name || "Member", resetUrl),
          });

          if (resendError) {
            console.error("[AUTH] Resend rejected reset password email:", resendError);
          } else if (resendData?.id) {
            emailSent = true;
            console.log(
              `[AUTH] Reset password email accepted by Resend (ID: ${resendData.id}) for user ${user.id}`
            );
          }
        } catch (emailErr) {
          console.error("[AUTH] Failed to send reset password email via Resend:", emailErr);
        }
      }

      if (!emailSent) {
        // Rollback created token so dead tokens do not accumulate
        await db.passwordResetToken.deleteMany({
          where: { token },
        }).catch(() => {});

        return {
          success: false,
          error:
            "Unable to send password recovery email at this time. Please try again later or contact support.",
        };
      }
    }

    // Always return generic response to avoid account enumeration
    return {
      success: true,
      message: "If an account exists with that email, a password reset link has been sent.",
    };
  } catch (err) {
    console.error("[AUTH] forgotPasswordAction error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Resets account password using a single-use token.
 */
export async function resetPasswordAction(
  data: ResetPasswordInput
): Promise<AuthActionResult> {
  try {
    const clientIp = await getClientIp();

    // 1. Rate Limiting (max 5 reset attempts per 5 minutes)
    const rateLimit = await checkRateLimit({
      key: clientIp,
      action: "reset_password",
      maxAttempts: 5,
      windowSeconds: 300,
    });

    if (!rateLimit.success) {
      return {
        success: false,
        error: rateLimit.error || "Too many reset attempts. Please wait.",
        rateLimited: true,
      };
    }

    // 2. Cloudflare Turnstile Verification
    const turnstile = await verifyTurnstileToken(data.turnstileToken, clientIp);
    if (!turnstile.success) {
      return {
        success: false,
        error: turnstile.error || "Security verification failed. Please try again.",
      };
    }

    // 3. Validate Input
    const validated = ResetPasswordSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const { token, password } = validated.data;
    const cleanToken = token.trim();

    const resetRecord = await db.passwordResetToken.findUnique({
      where: { token: cleanToken },
    });

    if (!resetRecord) {
      return { success: false, error: "Invalid or already used password reset link." };
    }

    if (resetRecord.expires < new Date()) {
      await db.passwordResetToken.delete({ where: { token: cleanToken } }).catch(() => {});
      return { success: false, error: "Password reset link has expired. Please request a new one." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Atomic update & single-use token deletion
    await db.$transaction([
      db.user.update({
        where: { email: resetRecord.email },
        data: { passwordHash },
      }),
      db.passwordResetToken.delete({
        where: { token: cleanToken },
      }),
    ]);

    return {
      success: true,
      message: "Your password has been reset successfully! You can now log in with your new password.",
    };
  } catch (err) {
    console.error("[AUTH] resetPasswordAction error:", err);
    return { success: false, error: "Failed to reset password. Please try again." };
  }
}

/**
 * Authoritative Server-Side Role and Redirect Resolution after Login.
 *
 * Guarantees:
 * - Coach -> /coach/dashboard only (or valid /coach/* path)
 * - Student -> /dashboard only (or valid /dashboard/*, /settings, /profile path)
 * - Admin/Super Admin -> /admin/dashboard only
 * - Rejects any student attempt to redirect to /coach or /admin
 * - Blocks suspended or blocked accounts
 * - Fails closed on missing or invalid roles
 */
export async function getPostLoginRedirectAction(
  intendedCallbackUrl?: string | null
): Promise<{
  success: boolean;
  role?: string;
  redirectUrl: string;
  error?: string;
}> {
  try {
    let session = null;
    try {
      session = await auth();
    } catch {
      session = null;
    }

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        redirectUrl: "/login",
        error: "Authentication failed. No active session.",
      };
    }

    const liveUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, role: true, isBlocked: true, emailVerified: true },
    });

    if (!liveUser) {
      return {
        success: false,
        redirectUrl: "/login",
        error: "User account no longer exists.",
      };
    }

    if (liveUser.isBlocked) {
      return {
        success: false,
        redirectUrl: "/login?error=BlockedAccount",
        error: "ACCOUNT_BLOCKED",
      };
    }

    const role = liveUser.role;

    if (role === Role.ADMIN || role === Role.SUPER_ADMIN) {
      return {
        success: true,
        role,
        redirectUrl: "/admin/dashboard",
      };
    }

    if (role === Role.COACH) {
      const coachApp = await db.coachApplication.findFirst({
        where: { email: { equals: liveUser.email, mode: "insensitive" } },
        select: { status: true },
      });

      if (coachApp && (coachApp.status === "SUSPENDED" || coachApp.status === "REJECTED")) {
        return {
          success: false,
          redirectUrl: "/login?error=CoachSuspended",
          error: "COACH_SUSPENDED",
        };
      }

      if (
        intendedCallbackUrl &&
        intendedCallbackUrl.startsWith("/coach") &&
        !intendedCallbackUrl.startsWith("/coach/dashboard")
      ) {
        return {
          success: true,
          role: Role.COACH,
          redirectUrl: intendedCallbackUrl,
        };
      }

      return {
        success: true,
        role: Role.COACH,
        redirectUrl: "/coach/dashboard",
      };
    }

    if (role === Role.STUDENT) {
      if (!liveUser.emailVerified) {
        return {
          success: false,
          redirectUrl: "/login?error=EMAIL_NOT_VERIFIED",
          error: "EMAIL_NOT_VERIFIED",
        };
      }

      // Sanitize callbackUrl: strictly reject /coach/* or /admin/* for students
      if (
        intendedCallbackUrl &&
        (intendedCallbackUrl.startsWith("/dashboard") ||
          intendedCallbackUrl.startsWith("/settings") ||
          intendedCallbackUrl.startsWith("/profile")) &&
        !intendedCallbackUrl.startsWith("/coach") &&
        !intendedCallbackUrl.startsWith("/admin")
      ) {
        return {
          success: true,
          role: Role.STUDENT,
          redirectUrl: intendedCallbackUrl,
        };
      }

      return {
        success: true,
        role: Role.STUDENT,
        redirectUrl: "/dashboard",
      };
    }

    // Fail-closed for invalid, unrecognized, or missing role
    return {
      success: false,
      redirectUrl: "/login?error=InvalidRole",
      error: "Invalid account role. Access denied.",
    };
  } catch (err: any) {
    console.error("getPostLoginRedirectAction error:", err);
    return {
      success: false,
      redirectUrl: "/login?error=AuthError",
      error: "Authorization failed. Please try again.",
    };
  }
}
