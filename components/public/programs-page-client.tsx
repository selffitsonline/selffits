"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { StudentScheduleSelector, StudentScheduleSelectionState } from "@/components/public/student-schedule-selector";
import {
  MARTIAL_ARTS_TYPES,
  MartialArtsTypeItem,
  DEFAULT_MARTIAL_ARTS_TYPE_ITEMS,
  resolveMartialArtsTypeLabel,
} from "@/lib/schedule-config";
import { ShieldCheck, Flame, Sparkles } from "lucide-react";
import { LearningJourneys } from "@/components/public/learning-journeys";
import { HomepageCouponCta } from "@/components/public/homepage-coupon-cta";
import { getAdminHomepageManagementAction, getMartialArtsTypesAction } from "@/actions/admin.actions";

type MainTab = "mma" | "hiit";
type MmaCategory = "kids" | "adults" | "ladies";

function getCategoryContextTitle(mainTab: MainTab, audience: MmaCategory) {
  if (mainTab === "mma") {
    switch (audience) {
      case "kids":
        return "Kids Martial Arts";
      case "adults":
        return "Adults Mix Martial Arts";
      case "ladies":
        return "Ladies Only Martial Arts";
    }
  } else {
    switch (audience) {
      case "kids":
        return "Kids Fitness & Weight Management";
      case "adults":
        return "Adult Fitness & Weight Management";
      case "ladies":
        return "Ladies Fitness & Weight Management";
    }
  }
}

interface ProgramsPageClientProps {
  initialNavItems?: any[];
  initialHomepageData?: any;
  initialMartialArtsTypes?: MartialArtsTypeItem[];
}

export let cachedClientMartialArtsTypes: MartialArtsTypeItem[] | null = null;

function ProgramsContent({
  initialNavItems,
  initialHomepageData,
  initialMartialArtsTypes,
}: ProgramsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (initialMartialArtsTypes && initialMartialArtsTypes.length > 0) {
    cachedClientMartialArtsTypes = initialMartialArtsTypes;
  }

  const [beltSyllabusData, setBeltSyllabusData] = useState<any>(
    () => initialHomepageData?.beltSyllabus || null
  );
  const [fitnessJourneyData, setFitnessJourneyData] = useState<any>(
    () => initialHomepageData?.fitnessJourney || null
  );
  const [couponCtaData, setCouponCtaData] = useState<any>(
    () => initialHomepageData?.couponCta || null
  );

  const [martialArtsTypesList, setMartialArtsTypesList] = useState<MartialArtsTypeItem[]>(
    () =>
      initialMartialArtsTypes && initialMartialArtsTypes.length > 0
        ? initialMartialArtsTypes
        : cachedClientMartialArtsTypes && cachedClientMartialArtsTypes.length > 0
        ? cachedClientMartialArtsTypes
        : DEFAULT_MARTIAL_ARTS_TYPE_ITEMS.map((item) => ({ ...item }))
  );

  useEffect(() => {
    if (initialHomepageData) {
      if (initialHomepageData.beltSyllabus) setBeltSyllabusData(initialHomepageData.beltSyllabus);
      if (initialHomepageData.fitnessJourney) setFitnessJourneyData(initialHomepageData.fitnessJourney);
      if (initialHomepageData.couponCta !== undefined) setCouponCtaData(initialHomepageData.couponCta);
    } else {
      getAdminHomepageManagementAction()
        .then((res) => {
          if (res?.success && res.homepageData) {
            if (res.homepageData.beltSyllabus) setBeltSyllabusData(res.homepageData.beltSyllabus);
            if (res.homepageData.fitnessJourney) setFitnessJourneyData(res.homepageData.fitnessJourney);
            if (res.homepageData.couponCta !== undefined) setCouponCtaData(res.homepageData.couponCta);
          }
        })
        .catch((err) => console.error("Failed to load fallback homepage data on programs page:", err));
    }

    // Only fallback-fetch if server initial props were omitted
    if (!initialMartialArtsTypes || initialMartialArtsTypes.length === 0) {
      getMartialArtsTypesAction()
        .then((res) => {
          if (res?.success && Array.isArray(res.types) && res.types.length > 0) {
            cachedClientMartialArtsTypes = res.types;
            setMartialArtsTypesList(res.types);
          }
        })
        .catch((err) => console.error("Failed to load fallback martial arts types:", err));
    }
  }, [initialHomepageData, initialMartialArtsTypes]);

  const urlCat = searchParams.get("cat");
  const urlAudience = searchParams.get("audience");
  const urlType = searchParams.get("type");

  const [mainTab, setMainTab] = useState<MainTab>(() =>
    urlCat === "hiit" ? "hiit" : "mma"
  );
  const [audienceCategory, setAudienceCategory] = useState<MmaCategory>(() =>
    urlAudience === "adults" ? "adults" : urlAudience === "ladies" ? "ladies" : "kids"
  );
  const [martialArtsType, setMartialArtsType] = useState<string>(() => {
    const types =
      initialMartialArtsTypes && initialMartialArtsTypes.length > 0
        ? initialMartialArtsTypes
        : DEFAULT_MARTIAL_ARTS_TYPE_ITEMS;
    if (urlType) {
      const matched = resolveMartialArtsTypeLabel(urlType, types);
      if (matched) return matched;
    }
    return types[0]?.label || "Karate";
  });

  useEffect(() => {
    if (urlCat === "hiit" || urlCat === "mma") {
      setMainTab(urlCat);
    }
    if (urlAudience === "adults" || urlAudience === "ladies" || urlAudience === "kids") {
      setAudienceCategory(urlAudience);
    }
    if (urlType) {
      const matched = resolveMartialArtsTypeLabel(urlType, martialArtsTypesList);
      if (matched) {
        setMartialArtsType(matched);
      }
    }
  }, [urlCat, urlAudience, urlType]);

  const handleScheduleCheckout = (state: StudentScheduleSelectionState) => {
    const params = new URLSearchParams();
    params.set("freq", String(state.daysPerWeek));
    params.set("days", state.selectedDays.join(","));
    params.set("batch", state.selectedBatch);
    params.set("currency", "USD");
    params.set("basePrice", String(state.monthlyPriceUSD));
    params.set("dietAddon", String(state.includeDietNutrition));
    params.set("dietPrice", String(state.dietNutritionPrice || 10));
    params.set("price", String(state.totalPriceUSD));
    params.set("plan", `plan-${state.daysPerWeek}-day`);
    if (mainTab === "mma" && martialArtsType) {
      params.set("type", martialArtsType);
    }

    router.push(`/checkout?${params.toString()}`);
  };

  const contextTitle = getCategoryContextTitle(mainTab, audienceCategory);

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header initialNavItems={initialNavItems} />

      <main className="flex-grow pt-28 pb-0 sm:pb-0">
        {/* Page Header Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E50914]/15 border border-[#E50914]/40 text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#E50914]">
            <Sparkles className="w-4 h-4" />
            Academy Offerings & Pricing
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-[family-name:var(--font-outfit)] tracking-tight">
            Explore Programs & Weekly Schedule
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Customize your training days, preferred GMT batch timing, and monthly membership plan. All live classes are held online via Zoom Classes with official certifications.
          </p>
        </section>

        {/* UNIFIED COMPACT PROGRAM CONTROL DOCK */}
        <section className="sticky top-[68px] sm:top-[76px] md:top-[80px] z-40 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-[#14161D]/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-white/15 shadow-2xl space-y-3">
            {/* Row 1: Program Category Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMainTab("mma");
                  setAudienceCategory("kids");
                }}
                className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                  mainTab === "mma"
                    ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
                <span>Mixed Martial Arts</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMainTab("hiit");
                  setAudienceCategory("kids");
                }}
                className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                  mainTab === "hiit"
                    ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Flame className="w-4.5 h-4.5 shrink-0" />
                <span>Fitness & Weight Management</span>
              </button>
            </div>

            {/* Row 1.5: Clean Radio Button Selection for Martial Arts Type under Mixed Martial Arts */}
            {mainTab === "mma" && (
              <div className="pt-2.5 border-t border-white/10 space-y-2">
                <div className="flex items-center px-1">
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-gray-300">
                    Martial Arts Type
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 px-0.5">
                  {martialArtsTypesList.map((item, index) => {
                    const isSelected = martialArtsType === item.label;
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-bold py-2 px-2.5 sm:px-3 rounded-xl transition-all select-none border whitespace-nowrap ${
                          isSelected
                            ? "bg-white/10 text-white border-white/20 shadow-sm"
                            : "text-gray-300 hover:text-white hover:bg-white/5 border-transparent"
                        } ${index === 4 ? "col-span-2 sm:col-span-1 md:col-span-1" : ""}`}
                      >
                        <input
                          type="radio"
                          name="martialArtsType"
                          value={item.label}
                          checked={isSelected}
                          onChange={() => setMartialArtsType(item.label)}
                          className="w-4 h-4 shrink-0 text-[#E50914] bg-[#0F1117] border-white/20 focus:ring-[#E50914] focus:ring-1 cursor-pointer accent-[#E50914]"
                        />
                        <span className={`whitespace-nowrap tracking-tight ${isSelected ? "text-white font-extrabold" : "text-gray-300"}`}>
                          {item.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Row 2: Audience Tabs with Integrated Age Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
              {(
                [
                  { label: "Kids", age: "8-20 Yrs", key: "kids" },
                  { label: "Adults Mix", age: "21+ Yrs", key: "adults" },
                  { label: "Ladies Only", age: "21+ Yrs", key: "ladies" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setAudienceCategory(cat.key)}
                  className={`px-2.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                    audienceCategory === cat.key
                      ? "bg-[#0080FF] text-white shadow-md shadow-[#0080FF]/25"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${
                      audienceCategory === cat.key ? "bg-white/20 text-white" : "bg-white/10 text-gray-300"
                    }`}
                  >
                    {cat.age}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SINGLE SOURCE OF TRUTH: PROMINENT INTERACTIVE SCHEDULE & BATCH BUILDER */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <StudentScheduleSelector
            category={mainTab === "mma" ? "mixed-martial-arts" : "fitness-weight-management"}
            group={audienceCategory}
            title={contextTitle}
            martialArtsType={mainTab === "mma" ? martialArtsType : undefined}
            initialDaysPerWeek={1}
            initialSelectedDays={["Sunday"]}
            showCheckoutCta={true}
            onCheckoutSubmit={handleScheduleCheckout}
          />
        </section>

        {/* SHARED ADMIN-MANAGED HOMEPAGE SECTIONS */}
        {/* 1. Martial Arts Learning Journey & 2. Weight Management Journey */}
        <LearningJourneys
          beltSyllabusData={beltSyllabusData}
          fitnessJourneyData={fitnessJourneyData}
          className="py-16 sm:py-24 bg-[#0A0B0E] border-t border-white/10 px-4 relative overflow-hidden space-y-16 sm:space-y-20 mt-16 sm:mt-24"
        />

        {/* 3. Coupon / Special Promotion (MUST APPEAR LAST) */}
        <HomepageCouponCta config={couponCtaData} />
      </main>

      <Footer />
    </div>
  );
}

export function ProgramsPageClient({
  initialNavItems,
  initialHomepageData,
  initialMartialArtsTypes,
}: ProgramsPageClientProps = {}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0B0E] text-white flex items-center justify-center">Loading programs...</div>}>
      <ProgramsContent
        initialNavItems={initialNavItems}
        initialHomepageData={initialHomepageData}
        initialMartialArtsTypes={initialMartialArtsTypes}
      />
    </Suspense>
  );
}
