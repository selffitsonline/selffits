"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Award,
  Sparkles,
  Edit,
  RotateCcw,
  Clock,
  Calendar,
  X,
  ShieldCheck,
  Flame,
  Users,
  Lock,
  Unlock,
  DollarSign,
  Check,
  BookOpen,
  FileText,
  Upload,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CentralScheduleConfig,
  DEFAULT_CENTRAL_SCHEDULE_CONFIG,
  DEFAULT_MEMBERSHIP_PLANS,
  DEFAULT_MMA_KIDS_SCHEDULE_CONFIG,
  DEFAULT_MMA_ADULTS_SCHEDULE_CONFIG,
  DEFAULT_MMA_LADIES_SCHEDULE_CONFIG,
  DEFAULT_FITNESS_KIDS_SCHEDULE_CONFIG,
  DEFAULT_FITNESS_ADULTS_SCHEDULE_CONFIG,
  DEFAULT_FITNESS_LADIES_SCHEDULE_CONFIG,
  getDefaultScheduleConfig,
  TrainingDayConfig,
  BatchTimingConfig,
  MembershipPlanConfig,
} from "@/lib/schedule-config";
import { getScheduleConfigAction, updateScheduleConfigAction } from "@/actions/schedule-config.actions";
import { getAdminProgramsCatalogAction, updateAdminProgramsCatalogAction } from "@/actions/admin.actions";
import {
  getDietNutritionConfigAction,
  updateDietNutritionConfigAction,
  DietNutritionConfig,
} from "@/actions/diet-nutrition.actions";

const DEFAULT_DIET_NUTRITION_CONFIG: DietNutritionConfig = {
  title: "Diet & Nutrition Program",
  description: "Personalized performance meal plan, calorie macro breakdown & healthy recipe guide (PDF download included).",
  priceUSD: 10,
  pdfUrl: null,
  pdfFileName: null,
  activeStatus: true,
};

type MainTab = "mma" | "hiit";
type SubCat = "kids" | "adults" | "ladies";

export function AdminProgramsView() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Active Category Context in Admin
  const [activeCategory, setActiveCategory] = useState<MainTab>("mma");
  const [activeSubCat, setActiveSubCat] = useState<SubCat>("kids");

  // Admin Management Section Tabs: "schedule_builder" | "category_metadata"
  const [managementSection, setManagementSection] = useState<"schedule_builder" | "category_metadata">("schedule_builder");

  // 1. Central Schedule & Pricing Configuration State per (Category x Audience Group)
  const [scheduleConfigs, setScheduleConfigs] = useState<Record<string, CentralScheduleConfig>>({
    "mma-kids": DEFAULT_MMA_KIDS_SCHEDULE_CONFIG,
    "mma-adults": DEFAULT_MMA_ADULTS_SCHEDULE_CONFIG,
    "mma-ladies": DEFAULT_MMA_LADIES_SCHEDULE_CONFIG,
    "hiit-kids": DEFAULT_FITNESS_KIDS_SCHEDULE_CONFIG,
    "hiit-adults": DEFAULT_FITNESS_ADULTS_SCHEDULE_CONFIG,
    "hiit-ladies": DEFAULT_FITNESS_LADIES_SCHEDULE_CONFIG,
  });

  const currentCompositeKey = `${activeCategory}-${activeSubCat}`;
  const scheduleConfig = scheduleConfigs[currentCompositeKey] || getDefaultScheduleConfig(activeCategory, activeSubCat);

  const updateActiveScheduleConfig = (updater: (prev: CentralScheduleConfig) => CentralScheduleConfig) => {
    setScheduleConfigs((prev) => ({
      ...prev,
      [currentCompositeKey]: updater(prev[currentCompositeKey] || getDefaultScheduleConfig(activeCategory, activeSubCat)),
    }));
  };

  // 2. Category Titles, Descriptions & Age Groups State
  const [categoryTitles, setCategoryTitles] = useState<Record<string, { title: string; age: string; description: string; classInfo: string }>>({
    "mma-kids": {
      title: "Kids Martial Arts",
      age: "Age: 08 Years to 20 Years",
      description: "Structured virtual martial arts progression teaching stances, kicks, discipline, and core techniques for young learners.",
      classInfo: "1-hour online live class",
    },
    "mma-adults": {
      title: "Adult Martial Arts",
      age: "Age: 21 Years+",
      description: "Comprehensive martial arts for adults. Enhance overall fitness, practical striking, defense maneuvers, and syllabus mastery.",
      classInfo: "1-hour online live class",
    },
    "mma-ladies": {
      title: "Ladies Martial Arts",
      age: "Age: 21 Years+",
      description: "Exclusive female-only online martial arts sessions focusing on self-defense, core strength, toning, and personal safety.",
      classInfo: "1-hour online live class",
    },
    "hiit-kids": {
      title: "Kids Fitness & Weight Management",
      age: "Age: 08 Years to 20 Years",
      description: "Fun, high-energy virtual fitness workouts designed to build stamina, agility, and core fitness for kids.",
      classInfo: "1-hour online live class",
    },
    "hiit-adults": {
      title: "Adult Fitness & Weight Management",
      age: "Age: 21 Years+",
      description: "Intense virtual fat-burning and cardio endurance workouts designed for adults.",
      classInfo: "1-hour online live class",
    },
    "hiit-ladies": {
      title: "Ladies Fitness & Weight Management",
      age: "Age: 21 Years+",
      description: "Female-focused online weight management, toning, and core strength workouts.",
      classInfo: "1-hour online live class",
    },
  });

  // Batch Form State for Adding/Editing Batches
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchStart, setNewBatchStart] = useState("05:15 PM");
  const [newBatchEnd, setNewBatchEnd] = useState("06:00 PM");

  // Diet & Nutrition Add-on Config State
  const [dietConfig, setDietConfig] = useState<DietNutritionConfig>(DEFAULT_DIET_NUTRITION_CONFIG);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          mmaKidsRes, mmaAdultsRes, mmaLadiesRes,
          hiitKidsRes, hiitAdultsRes, hiitLadiesRes,
          catRes,
          dietRes
        ] = await Promise.all([
          getScheduleConfigAction("mixed-martial-arts", "kids"),
          getScheduleConfigAction("mixed-martial-arts", "adults"),
          getScheduleConfigAction("mixed-martial-arts", "ladies"),
          getScheduleConfigAction("fitness-weight-management", "kids"),
          getScheduleConfigAction("fitness-weight-management", "adults"),
          getScheduleConfigAction("fitness-weight-management", "ladies"),
          getAdminProgramsCatalogAction(),
          getDietNutritionConfigAction(),
        ]);

        setScheduleConfigs({
          "mma-kids": (mmaKidsRes && mmaKidsRes.success && mmaKidsRes.config) ? mmaKidsRes.config : DEFAULT_MMA_KIDS_SCHEDULE_CONFIG,
          "mma-adults": (mmaAdultsRes && mmaAdultsRes.success && mmaAdultsRes.config) ? mmaAdultsRes.config : DEFAULT_MMA_ADULTS_SCHEDULE_CONFIG,
          "mma-ladies": (mmaLadiesRes && mmaLadiesRes.success && mmaLadiesRes.config) ? mmaLadiesRes.config : DEFAULT_MMA_LADIES_SCHEDULE_CONFIG,
          "hiit-kids": (hiitKidsRes && hiitKidsRes.success && hiitKidsRes.config) ? hiitKidsRes.config : DEFAULT_FITNESS_KIDS_SCHEDULE_CONFIG,
          "hiit-adults": (hiitAdultsRes && hiitAdultsRes.success && hiitAdultsRes.config) ? hiitAdultsRes.config : DEFAULT_FITNESS_ADULTS_SCHEDULE_CONFIG,
          "hiit-ladies": (hiitLadiesRes && hiitLadiesRes.success && hiitLadiesRes.config) ? hiitLadiesRes.config : DEFAULT_FITNESS_LADIES_SCHEDULE_CONFIG,
        });

        if (catRes && catRes.success && catRes.catalog) {
          const cat = catRes.catalog as any;
          if (cat.categoryTitles) {
            setCategoryTitles((prev) => ({ ...prev, ...cat.categoryTitles }));
          }
        }

        if (dietRes && dietRes.success && dietRes.config) {
          setDietConfig(dietRes.config);
        }
      } catch (err) {
        console.error("Failed to load admin schedule configuration:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Save Central Program Configuration to Database (Completely Isolated per Category & Audience Group)
  const handleSaveAllConfig = async () => {
    setIsSaving(true);

    try {
      const [
        s1, s2, s3, s4, s5, s6, catRes, dietRes
      ] = await Promise.all([
        updateScheduleConfigAction("mixed-martial-arts", "kids", scheduleConfigs["mma-kids"]),
        updateScheduleConfigAction("mixed-martial-arts", "adults", scheduleConfigs["mma-adults"]),
        updateScheduleConfigAction("mixed-martial-arts", "ladies", scheduleConfigs["mma-ladies"]),
        updateScheduleConfigAction("fitness-weight-management", "kids", scheduleConfigs["hiit-kids"]),
        updateScheduleConfigAction("fitness-weight-management", "adults", scheduleConfigs["hiit-adults"]),
        updateScheduleConfigAction("fitness-weight-management", "ladies", scheduleConfigs["hiit-ladies"]),
        updateAdminProgramsCatalogAction({ categoryTitles }),
        updateDietNutritionConfigAction(dietConfig),
      ]);

      const allSuccess = s1.success && s2.success && s3.success && s4.success && s5.success && s6.success && catRes.success && dietRes.success;

      if (allSuccess) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err: any) {
      console.error("Save config error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const renderPublishButton = (isFullWidth: boolean = false) => (
    <button
      type="button"
      onClick={handleSaveAllConfig}
      disabled={isSaving}
      className={`relative overflow-hidden px-5 py-2.5 rounded-xl text-white font-extrabold text-xs transition-all duration-300 transform active:scale-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
        isFullWidth ? "w-full sm:w-auto px-8 py-4 text-sm uppercase tracking-wider" : ""
      } ${
        isSaved
          ? "bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[#10B981]/30 ring-2 ring-[#10B981]/50 scale-105"
          : isSaving
          ? "bg-gradient-to-r from-[#0080FF] to-[#2563EB] animate-pulse"
          : "bg-gradient-to-r from-[#0080FF] to-[#2563EB] hover:from-[#0070E0] hover:to-[#1D4ED8] shadow-[#0080FF]/25 hover:shadow-[#0080FF]/40"
      }`}
    >
      {isSaved ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-white animate-bounce shrink-0" />
          <span>Published Live!</span>
        </>
      ) : isSaving ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Publishing...</span>
        </>
      ) : (
        <>
          <Save className="w-4 h-4 shrink-0" />
          <span>Publish All Program Changes</span>
        </>
      )}
    </button>
  );

  const handleResetDefaults = () => {
    const defaultCfg = getDefaultScheduleConfig(activeCategory, activeSubCat);
    updateActiveScheduleConfig(() => defaultCfg);
  };

  // Handler: Toggle Training Day vs Rest Day
  const handleToggleDayRestState = (dayName: string) => {
    updateActiveScheduleConfig((prev) => ({
      ...prev,
      trainingDays: prev.trainingDays.map((d) =>
        d.dayName === dayName
          ? {
              ...d,
              restDay: !d.restDay,
              selectable: d.restDay,
            }
          : d
      ),
    }));
  };

  // Handler: Update Membership Plan Pricing & Badges
  const handleUpdatePlanPrice = (
    daysPerWeek: number,
    field: "monthlyPriceUSD" | "monthlyPriceINR" | "badge" | "label" | "activeStatus",
    value: any
  ) => {
    updateActiveScheduleConfig((prev) => ({
      ...prev,
      membershipPlans: prev.membershipPlans.map((p) =>
        p.daysPerWeek === daysPerWeek ? { ...p, [field]: value } : p
      ),
    }));
  };

  // Handler: Update Curriculum Topic
  const handleUpdateCurriculumItem = (daysPerWeek: number, idx: number, text: string) => {
    updateActiveScheduleConfig((prev) => ({
      ...prev,
      membershipPlans: prev.membershipPlans.map((p) => {
        if (p.daysPerWeek === daysPerWeek) {
          const items = [...(p.curriculum || [])];
          items[idx] = text;
          return { ...p, curriculum: items };
        }
        return p;
      }),
    }));
  };

  // Handler: Add Curriculum Item
  const handleAddCurriculumItem = (daysPerWeek: number) => {
    updateActiveScheduleConfig((prev) => ({
      ...prev,
      membershipPlans: prev.membershipPlans.map((p) => {
        if (p.daysPerWeek === daysPerWeek) {
          const items = [...(p.curriculum || []), "New learning topic / technique"];
          return { ...p, curriculum: items };
        }
        return p;
      }),
    }));
  };

  // Handler: Delete Curriculum Item
  const handleDeleteCurriculumItem = (daysPerWeek: number, idx: number) => {
    updateActiveScheduleConfig((prev) => ({
      ...prev,
      membershipPlans: prev.membershipPlans.map((p) => {
        if (p.daysPerWeek === daysPerWeek) {
          const items = (p.curriculum || []).filter((_, i) => i !== idx);
          return { ...p, curriculum: items };
        }
        return p;
      }),
    }));
  };

  // Handler: Toggle Batch Active Status
  const handleToggleBatchStatus = (batchId: string) => {
    updateActiveScheduleConfig((prev) => ({
      ...prev,
      batchTimings: prev.batchTimings.map((b) =>
        b.id === batchId ? { ...b, activeStatus: !b.activeStatus } : b
      ),
    }));
  };

  // Handler: Delete Batch
  const handleDeleteBatch = (batchId: string) => {
    updateActiveScheduleConfig((prev) => ({
      ...prev,
      batchTimings: prev.batchTimings.filter((b) => b.id !== batchId),
    }));
  };

  // Handler: Add New Batch Timing Slot
  const handleAddNewBatch = () => {
    if (!newBatchName.trim()) return;
    const newId = `batch-${Date.now()}`;
    const newBatch: BatchTimingConfig = {
      id: newId,
      batchName: newBatchName.trim(),
      startTime: newBatchStart.trim(),
      endTime: newBatchEnd.trim(),
      timezone: "GMT (UTC+0)",
      displayLabel: `${newBatchStart.trim()} – ${newBatchEnd.trim()}`,
      activeStatus: true,
    };
    updateActiveScheduleConfig((prev) => ({
      ...prev,
      batchTimings: [...prev.batchTimings, newBatch],
    }));
    setNewBatchName("");
  };

  // Handler: Upload Diet & Nutrition PDF File
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return;
    }

    setIsUploadingPdf(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setDietConfig((prev) => ({
          ...prev,
          pdfUrl: "/uploads/protected/diet_nutrition_plan.pdf",
          pdfFileName: data.fileName,
        }));
      }
    } catch (err: any) {
      // PDF upload network error
    } finally {
      setIsUploadingPdf(false);
    }
  };

  // Context Key for Metadata
  const contextKey = `${activeCategory}-${activeSubCat}`;
  const currentMetadata = categoryTitles[contextKey] || {
    title: activeCategory === "mma" ? "Martial Arts" : "Fitness & Weight Management",
    age: activeSubCat === "kids" ? "Age: 08 Years to 20 Years" : "Age: 21 Years+",
    description: "Interactive online live academy sessions.",
    classInfo: "1-hour online live class",
  };

  const handleUpdateMetadata = (field: string, value: string) => {
    setCategoryTitles((prev) => ({
      ...prev,
      [contextKey]: {
        ...currentMetadata,
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="p-8 text-center text-gray-400">Loading Program Architecture & Schedule Configuration...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header & Global Save Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0080FF] px-2.5 py-1 rounded-full bg-[#0080FF]/15 border border-[#0080FF]/30">
              Centralized Program Control Center
            </span>
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)] mt-2">
              Program Architecture & Schedule Builder Management
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Configure weekly membership pricing, training days, rest days, GMT batch timings, curriculums, and category details.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Reset System Defaults
            </button>

            {renderPublishButton(false)}
          </div>
        </div>


        {/* 1. Category Context Navigation Bar */}
        <div className="bg-[#14161D] p-3 rounded-2xl border border-white/10 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Main Category Selection */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveCategory("mma")}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeCategory === "mma"
                    ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Mixed Martial Arts
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory("hiit")}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeCategory === "hiit"
                    ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Flame className="w-4 h-4" /> Fitness & Weight Management
              </button>
            </div>

            {/* Audience Subcategory Selection */}
            <div className="flex items-center gap-2 bg-[#0F1117] p-1.5 rounded-xl border border-white/10">
              {(
                [
                  { label: "Kids", key: "kids" },
                  { label: "Adults Mix", key: "adults" },
                  { label: "Ladies Only", key: "ladies" },
                ] as const
              ).map((sub) => (
                <button
                  key={sub.key}
                  type="button"
                  onClick={() => setActiveSubCat(sub.key)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSubCat === sub.key
                      ? "bg-[#0080FF] text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section View Tabs: Schedule Builder vs Category Metadata */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            type="button"
            onClick={() => setManagementSection("schedule_builder")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              managementSection === "schedule_builder"
                ? "bg-[#0080FF] text-white shadow-md shadow-[#0080FF]/25"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" /> Schedule Builder & Pricing Controls
          </button>
          <button
            type="button"
            onClick={() => setManagementSection("category_metadata")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              managementSection === "category_metadata"
                ? "bg-[#0080FF] text-white shadow-md shadow-[#0080FF]/25"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Category Titles & Descriptions
          </button>
        </div>

        {/* SECTION 1: SCHEDULE BUILDER & PRICING CONTROLS */}
        {managementSection === "schedule_builder" && (
          <div className="space-y-8">
            {/* 1. WEEKLY TRAINING DAYS & REST DAYS CONFIGURATOR */}
            <div className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2 font-[family-name:var(--font-outfit)]">
                    <Calendar className="w-4 h-4 text-[#E50914]" /> Weekly Training Days & Rest Days Configurator
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Click any day to toggle between Available Training Day (Selectable) and Rest Day (Locked).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
                {scheduleConfig.trainingDays.map((dayObj) => {
                  const isRest = dayObj.restDay || !dayObj.selectable;
                  return (
                    <button
                      key={dayObj.dayName}
                      type="button"
                      onClick={() => handleToggleDayRestState(dayObj.dayName)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        !isRest
                          ? "bg-[#0A0B0E] border-emerald-500/40 text-white hover:border-emerald-400 shadow-md"
                          : "bg-[#0A0B0E]/60 border-red-500/30 text-gray-400 hover:border-red-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                          {dayObj.dayName}
                        </span>
                        {!isRest ? (
                          <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-red-400" />
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block text-center ${
                          !isRest
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {!isRest ? "TRAINING DAY" : "REST DAY"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. BATCH TIMINGS MANAGEMENT */}
            <div className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2 font-[family-name:var(--font-outfit)]">
                    <Clock className="w-4 h-4 text-[#0080FF]" /> Class Batch Timings Manager (GMT UTC+0)
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Configure available virtual batch timing slots displayed in the student schedule selector.
                  </p>
                </div>
              </div>

              {/* Batches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scheduleConfig.batchTimings.map((batch) => (
                  <div
                    key={batch.id}
                    className={`p-4 rounded-xl border space-y-3 bg-[#0A0B0E] transition-all ${
                      batch.activeStatus !== false
                        ? "border-white/15"
                        : "border-white/5 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase text-[#0080FF] tracking-wider">
                        {batch.batchName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleBatchStatus(batch.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                            batch.activeStatus !== false
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-white/10 text-gray-400 border border-white/10"
                          }`}
                        >
                          {batch.activeStatus !== false ? "Active" : "Disabled"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBatch(batch.id)}
                          className="p-1 rounded text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="font-mono text-sm font-extrabold text-white bg-[#14161D] p-2.5 rounded-lg border border-white/10 text-center">
                      {batch.startTime} – {batch.endTime} ({batch.timezone})
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Batch Form */}
              <div className="p-4 rounded-xl bg-[#0F1117] border border-white/10 space-y-3">
                <span className="text-xs font-bold uppercase text-gray-300 block">
                  + Add New Batch Timing Slot:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Batch Name (e.g. 4th Batch)"
                    value={newBatchName}
                    onChange={(e) => setNewBatchName(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                  />
                  <input
                    type="text"
                    placeholder="Start Time (e.g. 05:15 PM)"
                    value={newBatchStart}
                    onChange={(e) => setNewBatchStart(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                  />
                  <input
                    type="text"
                    placeholder="End Time (e.g. 06:00 PM)"
                    value={newBatchEnd}
                    onChange={(e) => setNewBatchEnd(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewBatch}
                    className="h-10 px-4 rounded-lg bg-[#0080FF] hover:bg-[#0066CC] text-white text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Batch Slot
                  </button>
                </div>
              </div>
            </div>

            {/* 3. WEEKLY MEMBERSHIP PRICING & PLAN CURRICULUMS (1 to 5 Days / Week) */}
            <div className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2 font-[family-name:var(--font-outfit)]">
                    <DollarSign className="w-4 h-4 text-emerald-400" /> Weekly Membership Pricing & Plan Curriculums (1–5 Days/Wk)
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Configure monthly USD ($) pricing, badges, and learning topics for each frequency tier.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {scheduleConfig.membershipPlans.map((plan) => (
                  <div
                    key={plan.daysPerWeek}
                    className="p-5 rounded-2xl bg-[#0A0B0E] border border-white/15 space-y-4 shadow-lg"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-[#0080FF]/20 border border-[#0080FF]/40 text-[#0080FF] font-black text-sm flex items-center justify-center">
                          {plan.daysPerWeek}
                        </span>
                        <div>
                          <h4 className="text-base font-extrabold text-white font-[family-name:var(--font-outfit)]">
                            {plan.label || `${plan.daysPerWeek} Day${plan.daysPerWeek > 1 ? "s" : ""} / Week`}
                          </h4>
                          <span className="text-[11px] text-gray-400 font-semibold">
                            {plan.daysPerWeek * 4} live classes / month
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdatePlanPrice(
                              plan.daysPerWeek,
                              "activeStatus",
                              plan.activeStatus === false ? true : false
                            )
                          }
                          className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border cursor-pointer ${
                            plan.activeStatus !== false
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-white/10 text-gray-400 border-white/10"
                          }`}
                        >
                          {plan.activeStatus !== false ? "Active Tier" : "Disabled Tier"}
                        </button>
                      </div>
                    </div>

                    {/* Inputs: USD Price, Badge */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                          Price USD ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">$</span>
                          <input
                            type="number"
                            value={plan.monthlyPriceUSD}
                            onChange={(e) =>
                              handleUpdatePlanPrice(
                                plan.daysPerWeek,
                                "monthlyPriceUSD",
                                Number(e.target.value) || 0
                              )
                            }
                            className="w-full h-10 pl-7 pr-3 rounded-lg bg-[#14161D] border border-white/10 text-white font-mono text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                          Badge Label (Optional)
                        </label>
                        <input
                          type="text"
                          value={plan.badge || ""}
                          onChange={(e) =>
                            handleUpdatePlanPrice(
                              plan.daysPerWeek,
                              "badge",
                              e.target.value ? e.target.value : null
                            )
                          }
                          placeholder="e.g. MOST POPULAR or BEST VALUE"
                          className="w-full h-10 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                        />
                      </div>
                    </div>

                    {/* Curriculum Points for this Frequency Tier */}
                    <div className="pt-2 space-y-2 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">
                          Tier Curriculum Topics ({plan.curriculum?.length || 0} Topics):
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddCurriculumItem(plan.daysPerWeek)}
                          className="px-2.5 py-1 rounded bg-[#0080FF]/20 text-[#0080FF] text-[11px] font-bold hover:bg-[#0080FF]/30 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Topic
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(plan.curriculum || []).map((topic, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#14161D] border border-white/15 text-[10px] font-bold text-[#0080FF] flex items-center justify-center shrink-0">
                              {tIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={topic}
                              onChange={(e) =>
                                handleUpdateCurriculumItem(plan.daysPerWeek, tIdx, e.target.value)
                              }
                              className="flex-grow h-9 px-3 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#0080FF]"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteCurriculumItem(plan.daysPerWeek, tIdx)}
                              className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. DIET & NUTRITION PROGRAM ADD-ON MANAGER */}
            <div className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2 font-[family-name:var(--font-outfit)]">
                    <FileText className="w-4 h-4 text-[#10B981]" /> Optional Diet & Nutrition Program Add-on Settings
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Configure optional Diet & Nutrition add-on title, description, USD price, active status, and upload downloadable PDF.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDietConfig((prev) => ({ ...prev, activeStatus: !prev.activeStatus }))}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase border cursor-pointer transition-all ${
                    dietConfig.activeStatus
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-white/10 text-gray-400 border-white/10"
                  }`}
                >
                  {dietConfig.activeStatus ? "Add-on Enabled" : "Add-on Disabled"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                      Program Add-on Title
                    </label>
                    <input
                      type="text"
                      value={dietConfig.title}
                      onChange={(e) => setDietConfig((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full h-10 px-3.5 rounded-lg bg-[#0F1117] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#10B981]"
                      placeholder="e.g. Diet & Nutrition Program"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                      Add-on Price USD ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">$</span>
                      <input
                        type="number"
                        value={dietConfig.priceUSD}
                        onChange={(e) =>
                          setDietConfig((prev) => ({ ...prev, priceUSD: Number(e.target.value) || 0 }))
                        }
                        className="w-full h-10 pl-7 pr-3 rounded-lg bg-[#0F1117] border border-white/10 text-white font-mono text-xs font-bold focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                      Upload / Replace Protected PDF File
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2.5 rounded-xl bg-[#10B981]/20 hover:bg-[#10B981]/30 border border-[#10B981]/40 text-[#10B981] text-xs font-bold transition-all cursor-pointer flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>{isUploadingPdf ? "Uploading..." : "Select PDF File"}</span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handlePdfUpload}
                          disabled={isUploadingPdf}
                          className="hidden"
                        />
                      </label>

                      {dietConfig.pdfFileName ? (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PDF: {dietConfig.pdfFileName}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-amber-400 font-medium">No PDF file uploaded yet</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                    Add-on Short Description
                  </label>
                  <textarea
                    rows={6}
                    value={dietConfig.description}
                    onChange={(e) => setDietConfig((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3.5 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-[#10B981]"
                    placeholder="Enter short description for students..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: CATEGORY TITLES & METADATA */}
        {managementSection === "category_metadata" && (
          <div className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2 font-[family-name:var(--font-outfit)]">
                  <BookOpen className="w-4 h-4 text-[#0080FF]" /> Context Titles & Age Group Metadata
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Currently editing configuration for: <span className="text-[#0080FF] font-bold">{activeCategory.toUpperCase()} → {activeSubCat.toUpperCase()}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Program Display Title
                  </label>
                  <input
                    type="text"
                    value={currentMetadata.title}
                    onChange={(e) => handleUpdateMetadata("title", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-[#0080FF]"
                    placeholder="e.g. Kids Martial Arts"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Age Group Range Badge
                  </label>
                  <input
                    type="text"
                    value={currentMetadata.age}
                    onChange={(e) => handleUpdateMetadata("age", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-[#0080FF]"
                    placeholder="e.g. Age: 08 Years to 20 Years"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                    Class Format Info
                  </label>
                  <input
                    type="text"
                    value={currentMetadata.classInfo}
                    onChange={(e) => handleUpdateMetadata("classInfo", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-medium text-sm focus:outline-none focus:border-[#0080FF]"
                    placeholder="e.g. 1-hour online live class"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                  Category Description
                </label>
                <textarea
                  rows={6}
                  value={currentMetadata.description}
                  onChange={(e) => handleUpdateMetadata("description", e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-[#0080FF]"
                  placeholder="Enter program description..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button at bottom */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end">
          {renderPublishButton(true)}
        </div>
      </div>
    </AdminShell>
  );
}
