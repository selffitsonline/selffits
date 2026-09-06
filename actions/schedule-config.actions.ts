"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  CentralScheduleConfig,
  getDefaultScheduleConfig,
  getCompositeDbKey,
  normalizeCategoryKey,
  normalizeGroupKey,
} from "@/lib/schedule-config";

export async function getScheduleConfigAction(category?: string, group?: string): Promise<{
  success: boolean;
  config: CentralScheduleConfig;
  error?: string;
}> {
  try {
    const configKey = getCompositeDbKey(category, group);
    const defaultConfig = getDefaultScheduleConfig(category, group);

    let setting = await db.websiteSettings.findUnique({
      where: { key: configKey },
    });

    // Fallback checks for legacy keys if new composite key not created yet
    if (!setting) {
      const catKey = normalizeCategoryKey(category) === "fitness" ? "schedule_pricing_config_fitness" : "schedule_pricing_config_mma";
      setting = await db.websiteSettings.findUnique({ where: { key: catKey } });
    }

    if (!setting && normalizeCategoryKey(category) === "mma") {
      setting = await db.websiteSettings.findUnique({ where: { key: "schedule_pricing_config" } });
    }

    if (setting && setting.value) {
      const stored = setting.value as unknown as CentralScheduleConfig;
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
      config: getDefaultScheduleConfig(category, group),
    };
  }
}

export async function updateScheduleConfigAction(
  arg1: string | CentralScheduleConfig,
  arg2?: string | CentralScheduleConfig,
  arg3?: CentralScheduleConfig
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access to update schedule configuration." };
    }

    let category = "mma";
    let group = "adults";
    let configData: CentralScheduleConfig | undefined;

    if (typeof arg1 === "string" && typeof arg2 === "string" && arg3) {
      category = arg1;
      group = arg2;
      configData = arg3;
    } else if (typeof arg1 === "string" && typeof arg2 === "object" && arg2 !== null) {
      // arg1 might be composite key e.g. "mma-kids" or category name
      if (arg1.includes("-")) {
        const parts = arg1.split("-");
        category = parts[0];
        group = parts.slice(1).join("-");
      } else {
        category = arg1;
      }
      configData = arg2 as CentralScheduleConfig;
    } else if (typeof arg1 === "object" && arg1 !== null) {
      configData = arg1 as CentralScheduleConfig;
    }

    if (!configData || !Array.isArray(configData.trainingDays) || !Array.isArray(configData.batchTimings) || !Array.isArray(configData.membershipPlans)) {
      return { success: false, error: "Invalid schedule configuration payload." };
    }

    const configKey = getCompositeDbKey(category, group);
    const categoryName = normalizeCategoryKey(category) === "fitness" ? "Fitness & Weight Management" : "Mixed Martial Arts";
    const groupName = normalizeGroupKey(group) === "kids" ? "Kids" : normalizeGroupKey(group) === "ladies" ? "Ladies Only" : "Adults Mix";

    await db.websiteSettings.upsert({
      where: { key: configKey },
      update: { value: JSON.parse(JSON.stringify(configData)) },
      create: { key: configKey, value: JSON.parse(JSON.stringify(configData)) },
    });

    revalidatePath("/programs");
    revalidatePath("/checkout");
    revalidatePath("/admin/programs");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Saved schedule, batch timings, pricing & curriculum for ${categoryName} → ${groupName}!`,
    };
  } catch (err: any) {
    console.error("updateScheduleConfigAction error:", err);
    return { success: false, error: "Failed to save schedule configuration." };
  }
}
