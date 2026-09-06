"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface DietNutritionConfig {
  title: string;
  description: string;
  priceUSD: number;
  pdfUrl?: string | null;
  pdfFileName?: string | null;
  activeStatus: boolean;
}

const DEFAULT_DIET_NUTRITION_CONFIG: DietNutritionConfig = {
  title: "Diet & Nutrition Program",
  description: "Personalized performance meal plan, calorie macro breakdown & healthy recipe guide (PDF download included).",
  priceUSD: 10,
  pdfUrl: null,
  pdfFileName: null,
  activeStatus: true,
};

const DB_KEY = "diet_nutrition_config";

export async function getDietNutritionConfigAction(): Promise<{
  success: boolean;
  config: DietNutritionConfig;
  error?: string;
}> {
  try {
    const setting = await db.websiteSettings.findUnique({
      where: { key: DB_KEY },
    });

    if (setting && setting.value) {
      const stored = setting.value as unknown as Partial<DietNutritionConfig>;
      return {
        success: true,
        config: {
          title: stored.title || DEFAULT_DIET_NUTRITION_CONFIG.title,
          description: stored.description || DEFAULT_DIET_NUTRITION_CONFIG.description,
          priceUSD: typeof stored.priceUSD === "number" ? stored.priceUSD : DEFAULT_DIET_NUTRITION_CONFIG.priceUSD,
          pdfUrl: stored.pdfUrl ?? DEFAULT_DIET_NUTRITION_CONFIG.pdfUrl,
          pdfFileName: stored.pdfFileName ?? DEFAULT_DIET_NUTRITION_CONFIG.pdfFileName,
          activeStatus: stored.activeStatus !== false,
        },
      };
    }

    return { success: true, config: DEFAULT_DIET_NUTRITION_CONFIG };
  } catch (err: any) {
    console.error("getDietNutritionConfigAction error:", err);
    return { success: true, config: DEFAULT_DIET_NUTRITION_CONFIG };
  }
}

export async function updateDietNutritionConfigAction(
  newConfig: Partial<DietNutritionConfig>
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized access to update Diet & Nutrition configuration." };
    }

    const currentRes = await getDietNutritionConfigAction();
    const current = currentRes.config;

    const updated: DietNutritionConfig = {
      title: newConfig.title !== undefined ? newConfig.title.trim() : current.title,
      description: newConfig.description !== undefined ? newConfig.description.trim() : current.description,
      priceUSD: typeof newConfig.priceUSD === "number" ? Math.max(0, newConfig.priceUSD) : current.priceUSD,
      pdfUrl: newConfig.pdfUrl !== undefined ? newConfig.pdfUrl : current.pdfUrl,
      pdfFileName: newConfig.pdfFileName !== undefined ? newConfig.pdfFileName : current.pdfFileName,
      activeStatus: newConfig.activeStatus !== undefined ? newConfig.activeStatus : current.activeStatus,
    };

    await db.websiteSettings.upsert({
      where: { key: DB_KEY },
      update: { value: JSON.parse(JSON.stringify(updated)) },
      create: { key: DB_KEY, value: JSON.parse(JSON.stringify(updated)) },
    });

    revalidatePath("/programs");
    revalidatePath("/checkout");
    revalidatePath("/admin/programs");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/programs");

    return {
      success: true,
      message: "Diet & Nutrition Program configuration updated successfully!",
    };
  } catch (err: any) {
    console.error("updateDietNutritionConfigAction error:", err);
    return { success: false, error: "Failed to save Diet & Nutrition configuration." };
  }
}
