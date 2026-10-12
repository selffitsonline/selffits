"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { storageProvider } from "@/lib/storage";
import {
  AboutPageConfig,
  DEFAULT_ABOUT_PAGE_CONFIG,
  normalizeAboutPageConfig,
} from "@/lib/about-config";

async function fetchAboutPageConfigInternal(): Promise<AboutPageConfig> {
  try {
    const record = await db.websiteSettings.findUnique({
      where: { key: "about_page_config" },
      select: { value: true },
    });

    if (!record || !record.value) {
      return DEFAULT_ABOUT_PAGE_CONFIG;
    }

    return normalizeAboutPageConfig(record.value);
  } catch (err: any) {
    console.error("fetchAboutPageConfigInternal error:", err);
    return DEFAULT_ABOUT_PAGE_CONFIG;
  }
}

const getCachedAboutPageConfig = unstable_cache(
  fetchAboutPageConfigInternal,
  ["about_page_config_cache_key"],
  { tags: ["about_page_config"], revalidate: 3600 }
);

export async function getAboutPageConfigAction(): Promise<{
  success: boolean;
  config: AboutPageConfig;
  error?: string;
}> {
  try {
    const config = await getCachedAboutPageConfig();
    return { success: true, config };
  } catch (err: any) {
    console.error("getAboutPageConfigAction error:", err);
    return { success: true, config: DEFAULT_ABOUT_PAGE_CONFIG };
  }
}

export async function updateAboutPageConfigAction(
  rawConfig: AboutPageConfig
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await auth();
    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
    ) {
      return { success: false, error: "Unauthorized access to Admin portal." };
    }

    const cleanConfig = normalizeAboutPageConfig(rawConfig);

    await db.websiteSettings.upsert({
      where: { key: "about_page_config" },
      update: { value: cleanConfig as any },
      create: { key: "about_page_config", value: cleanConfig as any },
    });

    revalidateTag("about_page_config", { expire: 0 });
    revalidatePath("/about");
    revalidatePath("/admin/about");

    return {
      success: true,
      message: "About Us page content published live successfully!",
    };
  } catch (err: any) {
    console.error("updateAboutPageConfigAction error:", err);
    return { success: false, error: "Failed to save About Us page content." };
  }
}

export async function uploadAboutImageAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const session = await auth();
    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
    ) {
      return { success: false, error: "Unauthorized access." };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No image file provided." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await storageProvider.uploadFile(buffer, file.name, "about");
    return { success: true, url: result.publicUrl };
  } catch (err: any) {
    console.error("uploadAboutImageAction error:", err);
    return { success: false, error: "Failed to upload image." };
  }
}
