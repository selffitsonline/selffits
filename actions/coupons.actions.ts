"use server";

import { db, ensureCouponTables } from "@/lib/db";
import { auth } from "@/lib/auth";
import { DiscountType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface ValidateCouponResult {
  success: boolean;
  error?: string;
  message?: string;
  coupon?: {
    id: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    description?: string | null;
  };
  discountAmount?: number;
  finalAmount?: number;
  originalAmount?: number;
}

/**
 * Server-side core coupon validation and discount calculation.
 * Never trusts client-supplied discounts.
 */
export async function validateCouponAction(payload: {
  code: string;
  currentAmount: number;
  userId?: string;
  userEmail?: string;
}): Promise<ValidateCouponResult> {
  try {
    await ensureCouponTables();
    const rawCode = payload.code;
    const currentAmount = Math.max(0, Number(payload.currentAmount) || 0);

    if (!rawCode || typeof rawCode !== "string" || !rawCode.trim()) {
      return { success: false, error: "Please enter a valid coupon code." };
    }

    if (currentAmount <= 0) {
      return { success: false, error: "Coupon cannot be applied to an empty or zero amount purchase." };
    }

    // Normalized code comparison (case-insensitive & trimmed)
    const normalizedCode = rawCode.trim().toUpperCase();

    const coupon = await db.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon) {
      return { success: false, error: "Invalid coupon code." };
    }

    if (!coupon.isActive) {
      return { success: false, error: "This coupon is currently inactive." };
    }

    const now = new Date();

    if (coupon.startDate && now < coupon.startDate) {
      return { success: false, error: "This coupon is not yet active." };
    }

    if (coupon.expiryDate && now > coupon.expiryDate) {
      return { success: false, error: "This coupon has expired." };
    }

    if (coupon.maxUsageTotal !== null && coupon.usageCount >= coupon.maxUsageTotal) {
      return { success: false, error: "Coupon usage limit has been reached." };
    }

    // Customer-specific usage limit check
    if (coupon.maxUsagePerUser !== null && coupon.maxUsagePerUser > 0) {
      const targetUserId = payload.userId;
      const targetEmail = payload.userEmail ? payload.userEmail.toLowerCase().trim() : undefined;

      if (targetUserId || targetEmail) {
        const userUsageCount = await db.couponUsage.count({
          where: {
            couponId: coupon.id,
            OR: [
              ...(targetUserId ? [{ userId: targetUserId }] : []),
              ...(targetEmail ? [{ userEmail: targetEmail }] : []),
            ],
          },
        });

        if (userUsageCount >= coupon.maxUsagePerUser) {
          return { success: false, error: "You have already reached the maximum usage limit for this coupon." };
        }
      }
    }

    const discountVal = Number(coupon.discountValue);
    let calculatedDiscount = 0;

    if (coupon.discountType === "PERCENTAGE") {
      if (discountVal <= 0) {
        return { success: false, error: "Invalid coupon discount configuration." };
      }
      calculatedDiscount = (currentAmount * discountVal) / 100;
    } else if (coupon.discountType === "FIXED_AMOUNT") {
      if (discountVal <= 0) {
        return { success: false, error: "Invalid coupon discount configuration." };
      }
      calculatedDiscount = discountVal;
    } else {
      return { success: false, error: "Unsupported coupon discount type." };
    }

    // Safety checks: ensure discount cannot exceed original amount and final total cannot be negative
    const safeDiscount = Math.min(currentAmount, Math.round(calculatedDiscount * 100) / 100);
    const finalAmount = Math.max(0, Math.round((currentAmount - safeDiscount) * 100) / 100);

    return {
      success: true,
      message: "Coupon applied successfully!",
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: discountVal,
        description: coupon.description,
      },
      discountAmount: safeDiscount,
      finalAmount: finalAmount,
      originalAmount: currentAmount,
    };
  } catch (err: unknown) {
    console.error("validateCouponAction error:", err);
    return { success: false, error: "Failed to validate coupon code. Please try again." };
  }
}

// ==================================================
// ADMIN ACTIONS (Restricted to ADMIN / SUPER_ADMIN)
// ==================================================

async function requireAdminSession() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized: Only Admin users can perform this action.");
  }
  return session;
}

export interface SerializedAdminCoupon {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  isActive: boolean;
  startDate: string | null;
  expiryDate: string | null;
  maxUsageTotal: number | null;
  maxUsagePerUser: number | null;
  usageCount: number;
  usagesRecorded: number;
  createdAt: string;
  updatedAt: string;
}

function serializeCoupon(coupon: any): SerializedAdminCoupon {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description ?? null,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue != null ? Number(coupon.discountValue) : 0,
    isActive: Boolean(coupon.isActive),
    startDate: coupon.startDate ? new Date(coupon.startDate).toISOString() : null,
    expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString() : null,
    maxUsageTotal: coupon.maxUsageTotal != null ? Number(coupon.maxUsageTotal) : null,
    maxUsagePerUser: coupon.maxUsagePerUser != null ? Number(coupon.maxUsagePerUser) : null,
    usageCount: coupon.usageCount != null ? Number(coupon.usageCount) : 0,
    usagesRecorded:
      coupon._count?.usages != null
        ? Number(coupon._count.usages)
        : coupon.usagesRecorded != null
        ? Number(coupon.usagesRecorded)
        : 0,
    createdAt: coupon.createdAt ? new Date(coupon.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: coupon.updatedAt ? new Date(coupon.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export async function getAdminCouponsAction() {
  try {
    await requireAdminSession();
    await ensureCouponTables();

    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    return {
      success: true,
      coupons: coupons.map(serializeCoupon),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch coupons.";
    console.error("getAdminCouponsAction error:", err);
    return { success: false, error: errorMsg };
  }
}

export async function createAdminCouponAction(payload: {
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  isActive?: boolean;
  startDate?: string | null;
  expiryDate?: string | null;
  maxUsageTotal?: number | null;
  maxUsagePerUser?: number | null;
}) {
  try {
    await requireAdminSession();
    await ensureCouponTables();

    const normalizedCode = (payload.code || "").trim().toUpperCase();
    if (!normalizedCode || normalizedCode.length < 2) {
      return { success: false, error: "Coupon code must be at least 2 characters long." };
    }

    if (!/^[A-Z0-9_-]+$/.test(normalizedCode)) {
      return { success: false, error: "Coupon code can only contain letters, numbers, hyphens, and underscores." };
    }

    const discountVal = Number(payload.discountValue);
    if (isNaN(discountVal) || discountVal <= 0) {
      return { success: false, error: "Discount value must be a positive number greater than 0." };
    }

    if (payload.discountType === "PERCENTAGE" && discountVal > 100) {
      return { success: false, error: "Percentage discount cannot exceed 100%." };
    }

    const existing = await db.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (existing) {
      return { success: false, error: `Coupon code '${normalizedCode}' already exists.` };
    }

    const startDate = payload.startDate ? new Date(payload.startDate) : null;
    const expiryDate = payload.expiryDate ? new Date(payload.expiryDate) : null;

    if (startDate && expiryDate && startDate > expiryDate) {
      return { success: false, error: "Start date cannot be after expiry date." };
    }

    const maxUsageTotal = payload.maxUsageTotal !== undefined && payload.maxUsageTotal !== null && payload.maxUsageTotal > 0
      ? Math.floor(payload.maxUsageTotal)
      : null;

    const maxUsagePerUser = payload.maxUsagePerUser !== undefined && payload.maxUsagePerUser !== null && payload.maxUsagePerUser > 0
      ? Math.floor(payload.maxUsagePerUser)
      : null;

    const coupon = await db.coupon.create({
      data: {
        code: normalizedCode,
        description: payload.description ? payload.description.trim() : null,
        discountType: payload.discountType,
        discountValue: discountVal,
        isActive: payload.isActive !== undefined ? payload.isActive : true,
        startDate: startDate,
        expiryDate: expiryDate,
        maxUsageTotal: maxUsageTotal,
        maxUsagePerUser: maxUsagePerUser,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/coupons");
    revalidatePath("/admin/banner");

    return { success: true, coupon: serializeCoupon(coupon) };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to create coupon.";
    console.error("createAdminCouponAction error:", err);
    return { success: false, error: errorMsg };
  }
}

export async function updateAdminCouponAction(
  id: string,
  payload: {
    description?: string;
    discountType?: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue?: number;
    isActive?: boolean;
    startDate?: string | null;
    expiryDate?: string | null;
    maxUsageTotal?: number | null;
    maxUsagePerUser?: number | null;
  }
) {
  try {
    await requireAdminSession();
    await ensureCouponTables();

    const existing = await db.coupon.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Coupon not found." };
    }

    const updateData: Prisma.CouponUpdateInput = {};

    if (payload.description !== undefined) {
      updateData.description = payload.description ? payload.description.trim() : null;
    }

    if (payload.isActive !== undefined) {
      updateData.isActive = !!payload.isActive;
    }

    if (payload.discountType) {
      updateData.discountType = payload.discountType;
    }

    if (payload.discountValue !== undefined) {
      const discountVal = Number(payload.discountValue);
      if (isNaN(discountVal) || discountVal <= 0) {
        return { success: false, error: "Discount value must be greater than 0." };
      }
      const typeToCheck = payload.discountType || existing.discountType;
      if (typeToCheck === "PERCENTAGE" && discountVal > 100) {
        return { success: false, error: "Percentage discount cannot exceed 100%." };
      }
      updateData.discountValue = discountVal;
    }

    if (payload.startDate !== undefined) {
      updateData.startDate = payload.startDate ? new Date(payload.startDate) : null;
    }

    if (payload.expiryDate !== undefined) {
      updateData.expiryDate = payload.expiryDate ? new Date(payload.expiryDate) : null;
    }

    const effectiveStartDate = updateData.startDate !== undefined ? (updateData.startDate as Date | null) : existing.startDate;
    const effectiveExpiryDate = updateData.expiryDate !== undefined ? (updateData.expiryDate as Date | null) : existing.expiryDate;

    if (effectiveStartDate && effectiveExpiryDate && effectiveStartDate > effectiveExpiryDate) {
      return { success: false, error: "Start date cannot be after expiry date." };
    }

    if (payload.maxUsageTotal !== undefined) {
      updateData.maxUsageTotal = payload.maxUsageTotal && payload.maxUsageTotal > 0 ? Math.floor(payload.maxUsageTotal) : null;
    }

    if (payload.maxUsagePerUser !== undefined) {
      updateData.maxUsagePerUser = payload.maxUsagePerUser && payload.maxUsagePerUser > 0 ? Math.floor(payload.maxUsagePerUser) : null;
    }

    const updated = await db.coupon.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/");
    revalidatePath("/admin/coupons");
    revalidatePath("/admin/banner");

    return { success: true, coupon: serializeCoupon(updated) };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update coupon.";
    console.error("updateAdminCouponAction error:", err);
    return { success: false, error: errorMsg };
  }
}

export async function toggleAdminCouponActiveAction(id: string) {
  try {
    await requireAdminSession();
    await ensureCouponTables();

    const existing = await db.coupon.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Coupon not found." };
    }

    const updated = await db.coupon.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    revalidatePath("/");
    revalidatePath("/admin/coupons");
    revalidatePath("/admin/banner");

    return { success: true, isActive: updated.isActive };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to toggle coupon status.";
    console.error("toggleAdminCouponActiveAction error:", err);
    return { success: false, error: errorMsg };
  }
}

export async function deleteAdminCouponAction(id: string) {
  try {
    await requireAdminSession();
    await ensureCouponTables();

    const existing = await db.coupon.findUnique({
      where: { id },
      include: {
        _count: { select: { usages: true } },
      },
    });

    if (!existing) {
      return { success: false, error: "Coupon not found." };
    }

    // Safety rule: Never delete a coupon that has been used in actual transactions
    if (existing.usageCount > 0 || existing._count.usages > 0) {
      return {
        success: false,
        error: "Cannot delete a coupon that has been used in transactions. Deactivate the coupon instead to preserve historical records.",
      };
    }

    await db.coupon.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/coupons");
    revalidatePath("/admin/banner");

    return { success: true, message: "Coupon deleted successfully." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to delete coupon.";
    console.error("deleteAdminCouponAction error:", err);
    return { success: false, error: errorMsg };
  }
}

export async function getAdminCouponUsagesAction(couponId: string) {
  try {
    await requireAdminSession();
    await ensureCouponTables();

    const usages = await db.couponUsage.findMany({
      where: { couponId },
      orderBy: { usedAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        payment: { select: { amount: true, currency: true, razorpayOrderId: true, status: true } },
      },
    });

    return {
      success: true,
      usages: usages.map((u) => ({
        id: u.id,
        orderId: u.orderId,
        userEmail: u.userEmail || u.user?.email || "Unknown",
        userName: u.user?.name || "Customer",
        discountApplied: Number(u.discountApplied),
        paidAmount: u.payment ? Number(u.payment.amount) : null,
        currency: u.payment?.currency || "USD",
        paymentStatus: u.payment?.status || "SUCCESS",
        usedAt: u.usedAt.toISOString(),
      })),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch coupon usages.";
    console.error("getAdminCouponUsagesAction error:", err);
    return { success: false, error: errorMsg };
  }
}
