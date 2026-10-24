import { z } from "zod";
import { Role } from "@prisma/client";

// ==========================================
// Standard API Envelope Interfaces
// ==========================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ==========================================
// Auth DTOs & Validation Schemas
// ==========================================

export const MobileLoginSchema = z.object({
  email: z
    .string({ message: "Email address is required." })
    .email("Please provide a valid email address.")
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string({ message: "Password is required." })
    .min(1, "Password cannot be empty."),
  deviceInfo: z
    .object({
      platform: z.enum(["android", "ios", "unknown"]).optional(),
      deviceName: z.string().optional(),
      appVersion: z.string().optional(),
    })
    .optional(),
});

export type MobileLoginInput = z.infer<typeof MobileLoginSchema>;

export interface MobileUserSummaryDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  isBlocked: boolean;
  image?: string | null;
}

export interface MobileLoginResponseDto {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: MobileUserSummaryDto;
}

// ==========================================
// Student Dashboard DTOs
// ==========================================

export interface StudentScheduleSessionDto {
  nextClassDay: string;
  nextClassDate: string;
  nextClassFullDate: string;
  relativeLabel: string;
  isToday: boolean;
  clockTiming: string;
  timeSlot: string;
  dayCombination: string;
}

export interface StudentClassReadinessDto {
  hasBatch: boolean;
  isReady: boolean;
  batchId?: string | null;
  batchCode?: string | null;
  batchName?: string | null;
  programTitle?: string | null;
  levelName?: string | null;
  coachName?: string | null;
  coachRank?: string | null;
  dayCombination?: string | null;
  timeSlot?: string | null;
  clockTiming?: string | null;
  meetingUrl?: string | null;
  capacityLabel?: string | null;
  batchStatus?: string | null;
  nextSession: StudentScheduleSessionDto;
}

export interface StudentActiveEnrollmentSummaryDto {
  id: string;
  programTitle: string;
  tierName?: string | null;
  remainingClasses: number;
  totalClasses: number;
  expiryDate: string;
  daysRemaining: number;
  martialArtsType?: string | null;
  includeDietNutrition: boolean;
  status: string;
}

export interface StudentDashboardResponseDto {
  user: MobileUserSummaryDto;
  isEnrolled: boolean;
  enrollment: StudentActiveEnrollmentSummaryDto | null;
  enrollments?: StudentActiveEnrollmentSummaryDto[];
  classReadiness: StudentClassReadinessDto;
  unreadNotificationsCount: number;
}

// ==========================================
// Coach Dashboard DTOs
// ==========================================

export interface CoachStudentSummaryDto {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  assignedAt: string;
  martialArtsType?: string | null;
}

export interface CoachBatchSummaryDto {
  id: string;
  batchId: string;
  name: string;
  programTitle: string;
  beltLevel: string;
  dayCombination: string;
  timeSlot: string;
  clockTiming: string;
  meetingUrl: string | null;
  isMeetingActive: boolean;
  status: string;
  maxCapacity: number;
  studentsCount: number;
  students: CoachStudentSummaryDto[];
  nextSession: StudentScheduleSessionDto;
}

export interface CoachDashboardResponseDto {
  coach: {
    id: string;
    fullName: string;
    email: string;
    highestRank: string;
    disciplines: string[];
    profilePhotoUrl?: string | null;
  };
  totalBatchesCount: number;
  totalStudentsCount: number;
  upcomingClass: CoachBatchSummaryDto | null;
  batches: CoachBatchSummaryDto[];
}

// ==========================================
// Push Notification DTOs & Schemas (Module 6)
// ==========================================

export const RegisterDeviceTokenSchema = z.object({
  token: z
    .string({ message: "Device token is required." })
    .min(10, "Registration token is too short."),
  platform: z.enum(["ios", "android"], {
    message: "Platform must be either 'ios' or 'android'.",
  }),
  deviceId: z.string().optional(),
});

export type RegisterDeviceTokenInput = z.infer<typeof RegisterDeviceTokenSchema>;

export const UnregisterDeviceTokenSchema = z.object({
  token: z
    .string({ message: "Device token is required." })
    .min(1, "Token cannot be empty."),
});

export type UnregisterDeviceTokenInput = z.infer<typeof UnregisterDeviceTokenSchema>;

export type NotificationType =
  | "CLASS_REMINDER"
  | "SCHEDULE_CHANGE"
  | "CLASS_CANCELLED"
  | "ANNOUNCEMENT"
  | "ENROLLMENT_UPDATE"
  | "CERTIFICATE_AWARDED"
  | "GENERAL";

export interface MobileNotificationItemDto {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: NotificationType;
  deepLink?: string | null;
  batchId?: string | null;
  meetingUrl?: string | null;
}

export interface MobileNotificationsResponseDto {
  notifications: MobileNotificationItemDto[];
  unreadCount: number;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data: {
    type: NotificationType;
    deepLink?: string;
    batchId?: string;
    meetingUrl?: string;
    notificationId?: string;
    [key: string]: string | undefined;
  };
}

export interface ClassReminderCronResponseDto {
  success: boolean;
  timestamp: string;
  batchesScanned: number;
  remindersDispatched: number;
  errors?: string[];
}

// ==========================================
// Public Catalog DTOs
// ==========================================

export interface PublicMembershipPlanDto {
  daysPerWeek: number;
  monthlyPriceUSD: number;
  monthlyPriceINR: number;
  label: string;
  badge: string | null;
  activeStatus: boolean;
  curriculum: string[];
}

export interface PublicBatchTimingDto {
  id: string;
  batchName: string;
  startTime: string;
  endTime: string;
  timezone: string;
  displayLabel: string;
  activeStatus: boolean;
}

export interface PublicTrainingDayDto {
  dayName: string;
  selectable: boolean;
  restDay: boolean;
  activeStatus: boolean;
}

export interface PublicProgramCategoryDto {
  id: string;
  category: "mma" | "fitness";
  group: "kids" | "adults" | "ladies";
  title: string;
  description: string;
  targetAudience: string;
  membershipPlans: PublicMembershipPlanDto[];
  batchTimings: PublicBatchTimingDto[];
  trainingDays: PublicTrainingDayDto[];
}

export interface PublicDietNutritionDto {
  title: string;
  description: string;
  priceUSD: number;
  activeStatus: boolean;
}

export interface PublicPromotionDto {
  isEnabled: boolean;
  isCouponValid: boolean;
  badgeText: string;
  heading: string;
  description: string;
  couponCode: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  discountLabel: string;
  buttonText: string;
  buttonLink: string;
}

export interface PublicFeaturedProgramDto {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  classes: string;
  duration: string;
  priceStartsUSD: string;
  targetCategory: "mma" | "fitness";
  targetAudience: "kids" | "adults" | "ladies";
  href: string;
}

export interface PublicFeaturedProgramsSectionDto {
  headingBadge: string;
  headingTitle: string;
  headingSubtitle: string;
  items: PublicFeaturedProgramDto[];
}

export interface PublicBeltItemDto {
  id: string;
  name: string;
  subtitle: string;
  isEnabled: boolean;
  syllabus: string[];
}

export interface PublicBeltSyllabusSectionDto {
  headingBadge: string;
  headingTitle: string;
  headingSubtitle: string;
  belts: PublicBeltItemDto[];
}

export interface PublicFitnessJourneySectionDto {
  headingBadge: string;
  headingTitle: string;
  headingSubtitle: string;
  points: string[];
}

export interface PublicCoachDto {
  id: string;
  name: string;
  role: string;
  experience: string;
  rank: string;
  rating: string;
  statusBadge: string;
  image: string;
  bio: string;
  specialty: string;
}

export interface PublicCoachesSectionDto {
  headingBadge: string;
  headingTitle: string;
  headingSubtitle: string;
  items: PublicCoachDto[];
}

export interface PublicCatalogResponseDto {
  categories: PublicProgramCategoryDto[];
  martialArtsTypes: Array<{ id: string; label: string }>;
  dietNutrition?: PublicDietNutritionDto;
  promotion?: PublicPromotionDto | null;
  featuredProgramsSection?: PublicFeaturedProgramsSectionDto | null;
  beltSyllabusSection?: PublicBeltSyllabusSectionDto | null;
  fitnessJourneySection?: PublicFitnessJourneySectionDto | null;
  coachesSection?: PublicCoachesSectionDto | null;
  currencyNotice: string;
  checkoutBaseUrl: string;
  updatedAt: string;
}

// ==========================================
// Enrollment & Checkout DTOs
// ==========================================

export const MobileEnrollmentSchema = z.object({
  programCategory: z.enum(["mma", "fitness"]),
  audienceGroup: z.enum(["kids", "adults", "ladies"]),
  daysPerWeek: z.number().int().min(1).max(5),
  selectedDays: z.array(z.string()).min(1).max(5),
  batchId: z.string().min(1),
  martialArtsType: z.string().optional(),
  includeDietNutrition: z.boolean().default(false),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["card", "test_card", "razorpay"]).default("card"),
  currency: z.enum(["USD", "INR"]).default("USD"),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
});

export type MobileEnrollmentInput = z.infer<typeof MobileEnrollmentSchema>;

export interface MobileEnrollmentResponseDto {
  enrollmentId: string;
  programTitle: string;
  tierName: string;
  totalClassesGranted: number;
  remainingClasses: number;
  startDate: string;
  endDate: string;
  status: string;
  amountPaid: number;
  currency: string;
  discountAmount?: number;
  couponCode?: string | null;
  martialArtsType?: string | null;
  includeDietNutrition: boolean;
  batchName: string;
  classTiming: string;
  daysPerWeek: number;
  selectedDays: string[];
}

export const MobileCouponValidationSchema = z.object({
  code: z.string().min(1, "Coupon code is required."),
  currentAmount: z.number().positive("Amount must be greater than zero."),
});

export type MobileCouponValidationInput = z.infer<typeof MobileCouponValidationSchema>;

export interface MobileCouponValidationResponseDto {
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
  originalAmount: number;
  description?: string | null;
}



