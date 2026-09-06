"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  CentralScheduleConfig,
  DEFAULT_CENTRAL_SCHEDULE_CONFIG,
  getDefaultScheduleConfig,
  getDbKeyForCategory,
  normalizeCategoryKey,
  TrainingDayConfig,
  BatchTimingConfig,
  MembershipPlanConfig,
} from "@/lib/schedule-config";

export async function getScheduleConfigAction(category?: string): Promise<{
  success: boolean;
  config: CentralScheduleConfig;
  error?: string;
}> {
  try {
    const configKey = getDbKeyForCategory(category);
    const defaultConfig = getDefaultScheduleConfig(category);

    let setting = await db.websiteSettings.findUnique({
      where: { key: configKey },
    });

    // Fallback check for legacy key if MMA and new key not created yet
    if (!setting && normalizeCategoryKey(category) === "mma") {
      setting = await db.websiteSettings.findUnique({
        where: { key: "schedule_pricing_config" },
      });
    }

    if (setting && setting.value) {
      const stored = setting.value as unknown as CentralScheduleConfig;
      // Merge with defaults in case of missing fields
      const mergedConfig: CentralScheduleConfig = {
        trainingDays: stored.trainingDays || defaultConfig.trainingDays,
        batchTimings: stored.batchTimings || defaultConfig.batchTimings,
        membershipPlans: stored.membershipPlans || defaultConfig.membershipPlans,
      };
      return { success: true, config: mergedConfig };
    }

    return { success: true, config: defaultConfig };
  } catch (err: any) {
    console.error("getScheduleConfigAction error:", err);
    return {
      success: true,
      config: getDefaultScheduleConfig(category),
    };
  }
}

export async function updateScheduleConfigAction(
  categoryOrConfig: string | CentralScheduleConfig,
  maybeConfig?: CentralScheduleConfig
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access to update system schedule configuration." };
    }

    let category = "mixed-martial-arts";
    let configData: CentralScheduleConfig;

    if (typeof categoryOrConfig === "string") {
      category = categoryOrConfig;
      if (!maybeConfig) {
        return { success: false, error: "Invalid schedule configuration payload." };
      }
      configData = maybeConfig;
    } else {
      configData = categoryOrConfig;
    }

    if (!configData || !Array.isArray(configData.trainingDays) || !Array.isArray(configData.batchTimings) || !Array.isArray(configData.membershipPlans)) {
      return { success: false, error: "Invalid schedule configuration payload." };
    }

    const configKey = getDbKeyForCategory(category);
    const categoryName = normalizeCategoryKey(category) === "fitness" ? "Fitness & Weight Management" : "Mixed Martial Arts";

    await db.websiteSettings.upsert({
      where: { key: configKey },
      update: { value: JSON.parse(JSON.stringify(configData)) },
      create: { key: configKey, value: JSON.parse(JSON.stringify(configData)) },
    });

    revalidatePath("/programs");
    revalidatePath("/checkout");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/programs");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Weekly Schedule, Batch Timings, and Membership Pricing saved successfully for ${categoryName}!`,
    };
  } catch (err: any) {
    console.error("updateScheduleConfigAction error:", err);
    return { success: false, error: "Failed to save schedule configuration." };
  }
}
