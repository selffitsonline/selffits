import { z } from "zod";
import { validatePhoneNumberForCountry } from "@/lib/countries";

export const RegisterSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    country: z.string().min(1, "Please select your country"),
    phone: z.string().min(1, "Phone number is required"),
    age: z
      .number({ message: "Please select your age" })
      .min(4, "Age must be at least 4")
      .max(100, "Age must be at most 100"),
    gender: z.enum(["Male", "Female", "Other", "Prefer not to say"], {
      message: "Please select a valid gender option",
    }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }

    if (data.country && data.phone) {
      const phoneCheck = validatePhoneNumberForCountry(data.phone, data.country);
      if (!phoneCheck.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: phoneCheck.message || "Invalid phone number for selected country",
          path: ["phone"],
        });
      }
    }
  });

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
