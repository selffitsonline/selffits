import { z } from "zod";
import { validatePhoneNumberForCountry } from "@/lib/countries";

/**
 * Legacy Registration Schema (preserved for backward compatibility)
 */
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
    turnstileToken: z.string().optional(),
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

/**
 * 1. Martial Arts Registration Schema
 */
export const MartialArtsRegistrationSchema = z
  .object({
    registeredProgram: z.literal("MARTIAL_ARTS"),
    fullName: z.string().min(2, "Student full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(6, "Phone number is required"),
    country: z.string().optional(),
    studentType: z.enum(["Child (under 18)", "Adult (18+)"], {
      message: "Please select student type",
    }),
    martialArtsLevel: z.enum(
      [
        "Beginner — I'm just starting",
        "Intermediate — I have some experience",
        "Advanced — I train regularly",
      ],
      {
        message: "Please select your current martial arts level",
      }
    ),
    currentWeightKg: z.number().positive("Weight must be a positive number").optional(),
    trainingGoal: z.enum(
      [
        "Self-defence",
        "Fitness and flexibility",
        "Strength and endurance",
        "Belts and techniques",
        "Competition preparation",
        "Confidence and discipline",
      ],
      {
        message: "Please select your main training goal",
      }
    ),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
    turnstileToken: z.string().optional(),
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

/**
 * 2. Weight Management & Fitness Registration Schema
 */
export const WeightFitnessRegistrationSchema = z
  .object({
    registeredProgram: z.literal("WEIGHT_MANAGEMENT_FITNESS"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(6, "Phone number is required"),
    country: z.string().optional(),
    ageGroup: z.enum(["Child (under 18)", "Adult (18+)"], {
      message: "Please select your age group",
    }),
    currentWeightKg: z
      .number({ message: "Current weight in kg is required" })
      .positive("Current weight must be a positive number"),
    targetWeightKg: z.number().positive("Target weight must be a positive number").optional(),
    fitnessGoal: z.enum(
      [
        "Weight management",
        "Improve overall fitness",
        "Build strength and muscle",
        "Improve stamina and endurance",
        "Flexibility and mobility",
        "Healthy lifestyle",
      ],
      {
        message: "Please select your main fitness goal",
      }
    ),
    fitnessLevel: z.enum(["Beginner", "Intermediate", "Advanced"], {
      message: "Please select your current fitness level",
    }),
    workoutFrequency: z.enum(
      [
        "1–2 days per week",
        "3 days per week",
        "4–5 days per week",
        "Flexible schedule",
      ],
      {
        message: "Please select your preferred workout frequency",
      }
    ),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
    turnstileToken: z.string().optional(),
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

export const ProgramRegistrationSchema = z.discriminatedUnion("registeredProgram", [
  MartialArtsRegistrationSchema,
  WeightFitnessRegistrationSchema,
]);

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
  turnstileToken: z.string().optional(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  turnstileToken: z.string().optional(),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
    turnstileToken: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const ResendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
  turnstileToken: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type MartialArtsRegistrationInput = z.infer<typeof MartialArtsRegistrationSchema>;
export type WeightFitnessRegistrationInput = z.infer<typeof WeightFitnessRegistrationSchema>;
export type ProgramRegistrationInput = z.infer<typeof ProgramRegistrationSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof ResendVerificationSchema>;
