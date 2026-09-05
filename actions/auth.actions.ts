"use server";

import { db } from "@/lib/db";
import { resend, EMAIL_FROM } from "@/lib/resend";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/types/validation.schemas";
import { validatePhoneNumberForCountry } from "@/lib/countries";
import { WelcomeVerificationEmail } from "@/emails/welcome-verification.email";
import { ResetPasswordEmail } from "@/emails/reset-password.email";

export type AuthActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function registerStudentAction(
  data: RegisterInput
): Promise<AuthActionResult> {
  try {
    const validated = RegisterSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: "Validation failed. Please check the form errors.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const { firstName, lastName, email, phone, age, gender, country, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    const phoneValidation = validatePhoneNumberForCountry(phone, country);
    if (!phoneValidation.isValid) {
      return {
        success: false,
        error: phoneValidation.message || "Invalid phone number for the selected country.",
        fieldErrors: { phone: [phoneValidation.message || "Invalid phone number"] },
      };
    }

    const formattedPhone = phoneValidation.formatted || phone.trim();

    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email address already exists.",
        fieldErrors: { email: ["Email address is already registered"] },
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // Create user and student profile in a transaction
    const newUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name: fullName,
          email: normalizedEmail,
          passwordHash,
          role: "STUDENT",
          emailVerified: new Date(),
        },
      });

      await tx.studentProfile.create({
        data: {
          userId: user.id,
          phone: formattedPhone,
          age,
          gender,
          country: country.trim(),
        },
      });

      return user;
    });

    // Safe optional verification token generation & email dispatch
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db.verificationToken.create({
        data: {
          email: normalizedEmail,
          token,
          expires,
        },
      });

      const baseUrl = process.env.NEXTAUTH_URL || "https://selffits.vercel.app";
      const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

      await resend.emails.send({
        from: EMAIL_FROM,
        to: normalizedEmail,
        subject: "Verify Your SELFFITS Academy Account",
        react: WelcomeVerificationEmail({
          name: firstName,
          verificationUrl,
        }),
      });
    } catch (emailErr) {
      console.error("Non-blocking verification email/token error:", emailErr);
    }

    return {
      success: true,
      message: "Registration successful! Your student account has been created.",
    };
  } catch (err: any) {
    console.error("registerStudentAction error:", err);
    const detailMsg = err?.message || "Internal database processing error";
    return {
      success: false,
      error: `Registration error: ${detailMsg.slice(0, 150)}`,
    };
  }
}

export async function verifyEmailAction(token: string): Promise<AuthActionResult> {
  try {
    if (!token) {
      return { success: false, error: "Invalid verification token." };
    }

    const verificationRecord = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationRecord) {
      return { success: false, error: "Invalid or expired verification token." };
    }

    if (verificationRecord.expires < new Date()) {
      await db.verificationToken.delete({ where: { token } });
      return { success: false, error: "Verification token has expired. Please request a new link." };
    }

    await db.$transaction([
      db.user.update({
        where: { email: verificationRecord.email },
        data: { emailVerified: new Date() },
      }),
      db.verificationToken.delete({
        where: { token },
      }),
    ]);

    return {
      success: true,
      message: "Your email has been verified successfully! You can now log in.",
    };
  } catch (err) {
    console.error("verifyEmailAction error:", err);
    return { success: false, error: "Failed to verify email. Please try again." };
  }
}

export async function forgotPasswordAction(
  data: ForgotPasswordInput
): Promise<AuthActionResult> {
  try {
    const validated = ForgotPasswordSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: "Invalid email address",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const normalizedEmail = validated.data.email.toLowerCase().trim();
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

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: normalizedEmail,
          subject: "Reset Your SELFFITS Account Password",
          react: ResetPasswordEmail({
            name: user.name,
            resetUrl,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send reset password email via Resend:", emailErr);
      }
    }

    return {
      success: true,
      message: "If an account exists with that email, a password reset link has been sent.",
    };
  } catch (err) {
    console.error("forgotPasswordAction error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

export async function resetPasswordAction(
  data: ResetPasswordInput
): Promise<AuthActionResult> {
  try {
    const validated = ResetPasswordSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const { token, password } = validated.data;

    const resetRecord = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return { success: false, error: "Invalid or expired password reset link." };
    }

    if (resetRecord.expires < new Date()) {
      await db.passwordResetToken.delete({ where: { token } });
      return { success: false, error: "Password reset link has expired. Please request a new one." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.$transaction([
      db.user.update({
        where: { email: resetRecord.email },
        data: { passwordHash },
      }),
      db.passwordResetToken.delete({
        where: { token },
      }),
    ]);

    return {
      success: true,
      message: "Your password has been reset successfully! You can now log in with your new password.",
    };
  } catch (err) {
    console.error("resetPasswordAction error:", err);
    return { success: false, error: "Failed to reset password. Please try again." };
  }
}
