import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getDefaultScheduleConfig,
  getCompositeDbKey,
  CentralScheduleConfig,
  DEFAULT_MARTIAL_ARTS_TYPE_ITEMS,
  normalizeMartialArtsTypeItems,
} from "@/lib/schedule-config";
import { getAdminHomepageManagementAction } from "@/actions/admin.actions";
import {
  ApiResponse,
  PublicCatalogResponseDto,
  PublicProgramCategoryDto,
  PublicPromotionDto,
  PublicFeaturedProgramsSectionDto,
  PublicBeltSyllabusSectionDto,
  PublicFitnessJourneySectionDto,
  PublicCoachesSectionDto,
} from "@/types/mobile-api.dto";

// Authoritative Categories to expose for mobile public catalog
const CATALOG_DEFINITIONS: Array<{
  id: string;
  category: "mma" | "fitness";
  group: "kids" | "adults" | "ladies";
  title: string;
  description: string;
  targetAudience: string;
}> = [
  {
    id: "mma_kids",
    category: "mma",
    group: "kids",
    title: "Kids Martial Arts",
    description: "Structured Karate & Kung-Fu discipline for young champions ages 8–20. Builds confidence, balance, and focus.",
    targetAudience: "Kids (Ages 8–20)",
  },
  {
    id: "mma_adults",
    category: "mma",
    group: "adults",
    title: "Adults Mixed Martial Arts",
    description: "Comprehensive martial arts striking, self-defense blocks, animal katas, and explosive cardio conditioning.",
    targetAudience: "Adults (All Levels)",
  },
  {
    id: "mma_ladies",
    category: "mma",
    group: "ladies",
    title: "Ladies Only Martial Arts",
    description: "Empowering female-led martial arts, tactical self-defense, core strengthening, and stamina workouts.",
    targetAudience: "Ladies Only",
  },
  {
    id: "fitness_kids",
    category: "fitness",
    group: "kids",
    title: "Kids Fitness & Weight Management",
    description: "Engaging youth agility circuits, active calorie burning, and healthy postural conditioning for ages 8–20.",
    targetAudience: "Kids (Ages 8–20)",
  },
  {
    id: "fitness_adults",
    category: "fitness",
    group: "adults",
    title: "Adult Fitness & Weight Management",
    description: "High-intensity metabolic interval training, full-body fat burn, and athletic endurance development.",
    targetAudience: "Adults (All Levels)",
  },
  {
    id: "fitness_ladies",
    category: "fitness",
    group: "ladies",
    title: "Ladies Fitness & Weight Management",
    description: "Empowering female-tailored body sculpting, core stabilization, metabolic burn, and full-body toning workouts.",
    targetAudience: "Ladies Only",
  },
];

/**
 * Helper to fetch authoritative schedule config from WebsiteSettings with code default fallback
 */
async function fetchCategoryConfig(
  category: string,
  group: string
): Promise<CentralScheduleConfig> {
  const configKey = getCompositeDbKey(category, group);
  const defaultConfig = getDefaultScheduleConfig(category, group);

  try {
    const setting = await db.websiteSettings.findUnique({
      where: { key: configKey },
    });

    if (setting && setting.value) {
      const stored = setting.value as unknown as CentralScheduleConfig;
      return {
        trainingDays: stored.trainingDays || defaultConfig.trainingDays,
        batchTimings: stored.batchTimings || defaultConfig.batchTimings,
        membershipPlans: stored.membershipPlans || defaultConfig.membershipPlans,
      };
    }
  } catch (err) {
    console.error(`Error loading schedule config for ${configKey}:`, err);
  }

  return defaultConfig;
}

export async function GET(): Promise<NextResponse<ApiResponse<PublicCatalogResponseDto>>> {
  try {
    // 1. Fetch live configs for all defined categories and homepage management in parallel
    const [configs, catalogSetting, dietSetting, homepageRes] = await Promise.all([
      Promise.all(
        CATALOG_DEFINITIONS.map((def) =>
          fetchCategoryConfig(def.category, def.group)
        )
      ),
      db.websiteSettings.findUnique({
        where: { key: "programs_catalog" },
      }),
      db.websiteSettings.findUnique({
        where: { key: "diet_nutrition_config" },
      }),
      getAdminHomepageManagementAction().catch((err) => {
        console.warn("Failed to fetch homepage data for mobile catalog:", err);
        return { success: false, homepageData: null };
      }),
    ]);

    const hpData =
      homepageRes && homepageRes.success ? (homepageRes as any).homepageData : null;

    // 1.1 Special Promotion (Authoritative Coupon & Voucher)
    let promotion: PublicPromotionDto | null = null;
    if (
      hpData?.couponCta &&
      hpData.couponCta.isEnabled &&
      hpData.couponCta.isCouponValid &&
      hpData.couponCta.coupon
    ) {
      const c = hpData.couponCta.coupon;
      const isPercent = c.discountType === "PERCENTAGE";
      const numVal = Number(c.discountValue) || 0;
      const discountLabel = isPercent ? `${numVal}% OFF` : `$${numVal.toFixed(2)} OFF`;

      promotion = {
        isEnabled: true,
        isCouponValid: true,
        badgeText: hpData.couponCta.badgeText || "SPECIAL PROMOTION",
        heading: hpData.couponCta.heading || "Exclusive Academy Enrollment Offer",
        description:
          hpData.couponCta.description ||
          "Claim an exclusive discount on your live virtual training membership. Enter the coupon code during checkout.",
        couponCode: c.code,
        discountType: c.discountType,
        discountValue: numVal,
        discountLabel,
        buttonText: hpData.couponCta.buttonText || "Explore Programs & Redeem",
        buttonLink: hpData.couponCta.buttonLink || "/programs",
      };
    }

    // 1.2 Explore Our Programs (Featured Programs List)
    let featuredProgramsSection: PublicFeaturedProgramsSectionDto | null = null;
    if (hpData?.programs) {
      const rawItems = Array.isArray(hpData.programs.items) ? hpData.programs.items : [];
      const mappedItems = rawItems.map((item: any) => {
        const idLower = String(item.id || "").toLowerCase();
        const hrefLower = String(item.href || "").toLowerCase();
        const catLower = String(item.category || "").toLowerCase();

        let targetCategory: "mma" | "fitness" = "mma";
        if (
          idLower.includes("weight") ||
          idLower.includes("fitness") ||
          hrefLower.includes("hiit") ||
          catLower.includes("fitness")
        ) {
          targetCategory = "fitness";
        }

        let targetAudience: "kids" | "adults" | "ladies" = "adults";
        if (idLower.includes("kids") || hrefLower.includes("kids")) {
          targetAudience = "kids";
        } else if (
          idLower.includes("ladies") ||
          hrefLower.includes("ladies") ||
          catLower.includes("ladies")
        ) {
          targetAudience = "ladies";
        }

        return {
          id: item.id || `prog_${Math.random().toString(36).substring(7)}`,
          title: item.title || "Academy Program",
          category: item.category || "MARTIAL ARTS",
          image: item.image || "/images/adults_martial_arts.png",
          description:
            item.description ||
            "Join live interactive academy training with master instructors.",
          classes: item.classes || "4 - 20 Live Classes",
          duration: item.duration || "1 - 5 Days / Wk",
          priceStartsUSD: item.priceStartsUSD || "25",
          targetCategory,
          targetAudience,
          href: item.href || "/programs",
        };
      });

      featuredProgramsSection = {
        headingBadge: hpData.programs.headingBadge || "Training Pathways",
        headingTitle: hpData.programs.headingTitle || "Explore Our Programs",
        headingSubtitle:
          hpData.programs.headingSubtitle ||
          "Structured live virtual training paths with customizable weekly schedule frequencies from 1 to 5 Days / Week.",
        items: mappedItems,
      };
    }

    // 1.3 Martial Arts Learning Journey (Belt Progression Syllabus)
    let beltSyllabusSection: PublicBeltSyllabusSectionDto | null = null;
    if (hpData?.beltSyllabus) {
      const rawBelts = Array.isArray(hpData.beltSyllabus.belts)
        ? hpData.beltSyllabus.belts
        : [];
      beltSyllabusSection = {
        headingBadge:
          hpData.beltSyllabus.headingBadge || "BELT PROGRESSION SYLLABUS",
        headingTitle:
          hpData.beltSyllabus.headingTitle || "Your Martial Arts Learning Journey",
        headingSubtitle:
          hpData.beltSyllabus.headingSubtitle ||
          "Explore the skills, techniques, and syllabus covered at each belt progression rank from White Belt to Black Belt.",
        belts: rawBelts
          .filter((b: any) => b.isEnabled !== false)
          .map((b: any) => ({
            id: b.id,
            name: b.name,
            subtitle: b.subtitle || "Techniques & Learning Syllabus",
            isEnabled: b.isEnabled !== false,
            syllabus: Array.isArray(b.syllabus) ? b.syllabus : [],
          })),
      };
    }

    // 1.4 Weight Management Journey (Fitness Curriculum)
    let fitnessJourneySection: PublicFitnessJourneySectionDto | null = null;
    if (hpData?.fitnessJourney) {
      fitnessJourneySection = {
        headingBadge:
          hpData.fitnessJourney.headingBadge || "WEIGHT MANAGEMENT SYLLABUS",
        headingTitle:
          hpData.fitnessJourney.headingTitle || "Your Weight Management Journey",
        headingSubtitle:
          hpData.fitnessJourney.headingSubtitle ||
          "Explore the core fitness, HIIT cardio, muscle endurance, and body transformation modules covered in our Weight Management program.",
        points: Array.isArray(hpData.fitnessJourney.points)
          ? hpData.fitnessJourney.points
          : [],
      };
    }

    // 1.5 Meet Our Master Coaches
    let coachesSection: PublicCoachesSectionDto | null = null;
    if (hpData?.coaches) {
      const rawCoaches = Array.isArray(hpData.coaches.items)
        ? hpData.coaches.items
        : [];
      coachesSection = {
        headingBadge: hpData.coaches.headingBadge || "World Class Instructors",
        headingTitle: hpData.coaches.headingTitle || "Meet Our Master Coaches",
        headingSubtitle:
          hpData.coaches.headingSubtitle ||
          "Learn from certified black belt instructors and master fitness trainers dedicated to guiding your form and technique in real time.",
        items: rawCoaches.map((c: any) => ({
          id: c.id,
          name: c.name,
          role: c.role || "Certified Instructor",
          experience: c.experience || "Expert Instructor",
          rank: c.rank || "Certified Sensei",
          rating: c.rating || "4.9",
          statusBadge: c.statusBadge || "Live Form Evaluation Active",
          image: c.image || "/images/adults_martial_arts.png",
          bio: c.bio || "",
          specialty: c.specialty || "Martial Arts & Fitness",
        })),
      };
    }

    // 2. Resolve Martial Arts Types
    let martialArtsTypes = DEFAULT_MARTIAL_ARTS_TYPE_ITEMS.map((item) => ({
      id: item.id,
      label: item.label,
    }));

    if (catalogSetting && catalogSetting.value) {
      const rawCatalog = catalogSetting.value as any;
      if (rawCatalog.martialArtsTypes) {
        martialArtsTypes = normalizeMartialArtsTypeItems(
          rawCatalog.martialArtsTypes
        ).map((item) => ({ id: item.id, label: item.label }));
      }
    }

    // 2.1 Resolve Diet & Nutrition Add-on
    let dietNutrition = {
      title: "Diet & Nutrition Program",
      description:
        "Personalized performance meal plan, calorie macro breakdown & healthy recipe guide (PDF download included).",
      priceUSD: 10,
      activeStatus: true,
    };

    if (dietSetting && dietSetting.value) {
      const stored = dietSetting.value as any;
      dietNutrition = {
        title: stored.title || dietNutrition.title,
        description: stored.description || dietNutrition.description,
        priceUSD:
          typeof stored.priceUSD === "number"
            ? stored.priceUSD
            : dietNutrition.priceUSD,
        activeStatus: stored.activeStatus !== false,
      };
    }

    // 3. Assemble sanitized, authoritative category payloads
    const categories: PublicProgramCategoryDto[] = CATALOG_DEFINITIONS.map(
      (def, index) => {
        const config = configs[index];

        // Filter active membership plans and format strictly
        const activePlans = (config.membershipPlans || [])
          .filter((p) => p.activeStatus !== false)
          .map((p) => ({
            daysPerWeek: p.daysPerWeek,
            monthlyPriceUSD: Number(p.monthlyPriceUSD),
            monthlyPriceINR: Number(p.monthlyPriceINR),
            label: p.label,
            badge: p.badge || null,
            activeStatus: p.activeStatus !== false,
            curriculum: Array.isArray(p.curriculum) ? p.curriculum : [],
          }));

        // Filter active batch timings
        const activeTimings = (config.batchTimings || [])
          .filter((b) => b.activeStatus !== false)
          .map((b) => ({
            id: b.id,
            batchName: b.batchName,
            startTime: b.startTime,
            endTime: b.endTime,
            timezone: b.timezone,
            displayLabel: b.displayLabel,
            activeStatus: b.activeStatus !== false,
          }));

        const activeDays = (config.trainingDays || []).map((d) => ({
          dayName: d.dayName,
          selectable: d.selectable,
          restDay: d.restDay,
          activeStatus: d.activeStatus !== false,
        }));

        return {
          id: def.id,
          category: def.category,
          group: def.group,
          title: def.title,
          description: def.description,
          targetAudience: def.targetAudience,
          membershipPlans: activePlans,
          batchTimings: activeTimings,
          trainingDays: activeDays,
        };
      }
    );

    const catalogData: PublicCatalogResponseDto = {
      categories,
      martialArtsTypes,
      dietNutrition,
      promotion,
      featuredProgramsSection,
      beltSyllabusSection,
      fitnessJourneySection,
      coachesSection,
      currencyNotice:
        "Prices in USD ($) and INR (₹) synchronized with live academy administration.",
      checkoutBaseUrl: "https://selffits.com/checkout",
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: catalogData,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/v1/public/catalog error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CATALOG_FETCH_FAILED",
          message: "Failed to load authoritative program catalog. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}
