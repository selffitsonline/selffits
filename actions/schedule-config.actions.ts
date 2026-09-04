"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  CentralScheduleConfig,
  DEFAULT_CENTRAL_SCHEDULE_CONFIG,
  TrainingDayConfig,
  BatchTimingConfig,
  MembershipPlanConfig,
} from "@/lib/schedule-config";

const CONFIG_KEY = "schedule_pricing_config";

export async function getScheduleConfigAction(): Promise<{
  success: boolean;
  config: CentralScheduleConfig;
  error?: string;
}> {
  try {
    const setting = await db.websiteSettings.findUnique({
      where: { key: CONFIG_KEY },
    });

    if (setting && setting.value) {
      const stored = setting.value as unknown as CentralScheduleConfig;
      // Merge with defaults in case of missing fields
      const mergedConfig: CentralScheduleConfig = {
        trainingDays: stored.trainingDays || DEFAULT_CENTRAL_SCHEDULE_CONFIG.trainingDays,
        batchTimings: stored.batchTimings || DEFAULT_CENTRAL_SCHEDULE_CONFIG.batchTimings,
        membershipPlans: stored.membershipPlans || DEFAULT_CENTRAL_SCHEDULE_CONFIG.membershipPlans,
      };
      return { success: true, config: mergedConfig };
    }

    return { success: true, config: DEFAULT_CENTRAL_SCHEDULE_CONFIG };
  } catch (err: any) {
    console.error("getScheduleConfigAction error:", err);
    return {
      success: true,
      config: DEFAULT_CENTRAL_SCHEDULE_CONFIG,
    };
  }
}

export async function updateScheduleConfigAction(configData: CentralScheduleConfig): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access to update system schedule configuration." };
    }

    if (!configData || !Array.isArray(configData.trainingDays) || !Array.isArray(configData.batchTimings) || !Array.isArray(configData.membershipPlans)) {
      return { success: false, error: "Invalid schedule configuration payload." };
    }

    await db.websiteSettings.upsert({
      where: { key: CONFIG_KEY },
      update: { value: JSON.parse(JSON.stringify(configData)) },
      create: { key: CONFIG_KEY, value: JSON.parse(JSON.stringify(configData)) },
    });

    revalidatePath("/programs");
    revalidatePath("/checkout");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/programs");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Weekly Schedule, Batch Timings, and Membership Pricing configuration saved successfully!",
    };
  } catch (err: any) {
    console.error("updateScheduleConfigAction error:", err);
    return { success: false, error: "Failed to save schedule configuration." };
  }
}
