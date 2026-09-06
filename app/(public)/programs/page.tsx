"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { StudentScheduleSelector, StudentScheduleSelectionState } from "@/components/public/student-schedule-selector";
import { ShieldCheck, Flame, Sparkles } from "lucide-react";

type MainTab = "mma" | "hiit";
type MmaCategory = "kids" | "adults" | "ladies";

function getCategoryContextTitle(mainTab: MainTab, audience: MmaCategory) {
  if (mainTab === "mma") {
    switch (audience) {
      case "kids":
        return "Kids Martial Arts";
      case "adults":
        return "Adult Martial Arts";
      case "ladies":
        return "Ladies Martial Arts";
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

function ProgramsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCat = searchParams.get("cat");
  const urlAudience = searchParams.get("audience");

  const [mainTab, setMainTab] = useState<MainTab>(() =>
    urlCat === "hiit" ? "hiit" : "mma"
  );
  const [audienceCategory, setAudienceCategory] = useState<MmaCategory>(() =>
    urlAudience === "adults" ? "adults" : urlAudience === "ladies" ? "ladies" : "kids"
  );

  useEffect(() => {
    if (urlCat === "hiit" || urlCat === "mma") {
      setMainTab(urlCat);
    }
    if (urlAudience === "adults" || urlAudience === "ladies" || urlAudience === "kids") {
      setAudienceCategory(urlAudience);
    }
  }, [urlCat, urlAudience]);

  const handleScheduleCheckout = (state: StudentScheduleSelectionState) => {
    const params = new URLSearchParams();
    params.set("freq", String(state.daysPerWeek));
    params.set("days", state.selectedDays.join(","));
    params.set("batch", state.selectedBatch);
    params.set("currency", "USD");
    params.set("price", String(state.monthlyPriceUSD));
    params.set("plan", `plan-${state.daysPerWeek}-day`);

    router.push(`/checkout?${params.toString()}`);
  };

  const contextTitle = getCategoryContextTitle(mainTab, audienceCategory);

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-28 pb-20">
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
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-[#14161D] p-2.5 sm:p-3 rounded-2xl border border-white/15 shadow-2xl space-y-2.5">
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
            initialDaysPerWeek={1}
            initialSelectedDays={["Sunday"]}
            showCheckoutCta={true}
            onCheckoutSubmit={handleScheduleCheckout}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0B0E] text-white flex items-center justify-center">Loading programs...</div>}>
      <ProgramsContent />
    </Suspense>
  );
}
