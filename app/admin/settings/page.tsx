"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  CentralScheduleConfig,
  DEFAULT_MMA_SCHEDULE_CONFIG,
  DEFAULT_FITNESS_SCHEDULE_CONFIG,
  getDefaultScheduleConfig,
  TrainingDayConfig,
  BatchTimingConfig,
  MembershipPlanConfig,
} from "@/lib/schedule-config";
import { getScheduleConfigAction, updateScheduleConfigAction } from "@/actions/schedule-config.actions";
import {
  Settings,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  BookOpen,
  Flame,
} from "lucide-react";

type MainCategory = "mixed-martial-arts" | "fitness-weight-management";

export default function AdminSettingsPage() {
  const [selectedCategory, setSelectedCategory] = useState<MainCategory>("mixed-martial-arts");
  const [configs, setConfigs] = useState<Record<MainCategory, CentralScheduleConfig>>({
    "mixed-martial-arts": DEFAULT_MMA_SCHEDULE_CONFIG,
    "fitness-weight-management": DEFAULT_FITNESS_SCHEDULE_CONFIG,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const config = configs[selectedCategory] || getDefaultScheduleConfig(selectedCategory);

  const updateSelectedConfig = (updater: (prev: CentralScheduleConfig) => CentralScheduleConfig) => {
    setConfigs((prev) => ({
      ...prev,
      [selectedCategory]: updater(prev[selectedCategory] || getDefaultScheduleConfig(selectedCategory)),
    }));
  };

  useEffect(() => {
    async function loadConfigs() {
      setIsLoading(true);
      try {
        const [mmaRes, fitnessRes] = await Promise.all([
          getScheduleConfigAction("mixed-martial-arts"),
          getScheduleConfigAction("fitness-weight-management"),
        ]);
        setConfigs({
          "mixed-martial-arts": (mmaRes.success && mmaRes.config) ? mmaRes.config : DEFAULT_MMA_SCHEDULE_CONFIG,
          "fitness-weight-management": (fitnessRes.success && fitnessRes.config) ? fitnessRes.config : DEFAULT_FITNESS_SCHEDULE_CONFIG,
        });
      } catch (err) {
        console.error("Failed to load schedule configs:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfigs();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    const res = await updateScheduleConfigAction(selectedCategory, config);
    if (res.success) {
      setStatusMsg({ type: "success", text: res.message || "Schedule & pricing configuration updated successfully!" });
    } else {
      setStatusMsg({ type: "error", text: res.error || "Failed to update configuration." });
    }
    setIsSaving(false);

    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleDayRestToggle = (dayIndex: number) => {
    updateSelectedConfig((prev) => {
      const updatedDays = [...prev.trainingDays];
      const target = { ...updatedDays[dayIndex] };
      target.restDay = !target.restDay;
      target.selectable = !target.restDay;
      updatedDays[dayIndex] = target;
      return { ...prev, trainingDays: updatedDays };
    });
  };

  const handleBatchTimingChange = (batchIndex: number, field: keyof BatchTimingConfig, value: string) => {
    updateSelectedConfig((prev) => {
      const updatedBatches = [...prev.batchTimings];
      updatedBatches[batchIndex] = { ...updatedBatches[batchIndex], [field]: value };
      return { ...prev, batchTimings: updatedBatches };
    });
  };

  const handlePlanPriceChange = (planIndex: number, field: "monthlyPriceUSD" | "monthlyPriceINR" | "badge", value: any) => {
    updateSelectedConfig((prev) => {
      const updatedPlans = [...prev.membershipPlans];
      updatedPlans[planIndex] = { ...updatedPlans[planIndex], [field]: value };
      return { ...prev, membershipPlans: updatedPlans };
    });
  };

  const handlePlanCurriculumChange = (planIndex: number, topicIndex: number, text: string) => {
    updateSelectedConfig((prev) => {
      const updatedPlans = [...prev.membershipPlans];
      const curr = [...(updatedPlans[planIndex].curriculum || [])];
      curr[topicIndex] = text;
      updatedPlans[planIndex] = { ...updatedPlans[planIndex], curriculum: curr };
      return { ...prev, membershipPlans: updatedPlans };
    });
  };

  const handleAddPlanCurriculumItem = (planIndex: number) => {
    updateSelectedConfig((prev) => {
      const updatedPlans = [...prev.membershipPlans];
      const curr = [...(updatedPlans[planIndex].curriculum || []), "New learning syllabus topic"];
      updatedPlans[planIndex] = { ...updatedPlans[planIndex], curriculum: curr };
      return { ...prev, membershipPlans: updatedPlans };
    });
  };

  const handleDeletePlanCurriculumItem = (planIndex: number, topicIndex: number) => {
    updateSelectedConfig((prev) => {
      const updatedPlans = [...prev.membershipPlans];
      const curr = (updatedPlans[planIndex].curriculum || []).filter((_, i) => i !== topicIndex);
      updatedPlans[planIndex] = { ...updatedPlans[planIndex], curriculum: curr };
      return { ...prev, membershipPlans: updatedPlans };
    });
  };

  return (
    <AdminShell>
      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        {/* Page Header */}
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0080FF] px-2.5 py-1 rounded-full bg-[#0080FF]/15 border border-[#0080FF]/30">
            Admin Configuration Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)] mt-2">
            Independent Schedule, Batch, Curriculum & Pricing Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage category-specific training days, rest days, GMT batch timings, membership pricing, and syllabus curriculum. Changes save exclusively to the selected category.
          </p>
        </div>

        {/* Category Context Selector Dock */}
        <div className="bg-[#14161D] p-3 rounded-2xl border border-white/10 shadow-xl flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedCategory("mixed-martial-arts")}
            className={`flex-1 px-5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
              selectedCategory === "mixed-martial-arts"
                ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25 ring-2 ring-[#E50914]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Mixed Martial Arts</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("fitness-weight-management")}
            className={`flex-1 px-5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
              selectedCategory === "fitness-weight-management"
                ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25 ring-2 ring-[#E50914]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Fitness & Weight Management</span>
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border ${
              statusMsg.type === "success"
                ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
                : "bg-red-500/15 text-red-400 border-red-500/30"
            }`}
          >
            {statusMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm font-semibold flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#0080FF]" /> Loading central configuration from database...
          </div>
        ) : (
          <form onSubmit={handleSaveConfig} className="space-y-8">
            {/* 1. WEEKLY TRAINING DAYS & REST DAYS SECTION */}
            <div className="bg-[#14161D] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)] flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#0080FF]" /> A. Weekly Training Days & Rest Days
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Selectable Training Days vs. Non-Selectable Rest Days (Tuesday & Friday by default).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
                {config.trainingDays.map((day, idx) => (
                  <div
                    key={day.dayName}
                    className={`h-24 p-3.5 rounded-2xl border text-center flex flex-col items-center justify-between gap-1.5 ${
                      day.restDay
                        ? "bg-red-950/20 border-red-500/30 text-red-300"
                        : "bg-[#0F1117] border-emerald-500/30 text-emerald-300"
                    }`}
                  >
                    <span className="text-xs font-black text-white">{day.dayName}</span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${
                        day.restDay ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {day.restDay ? "REST DAY" : "AVAILABLE"}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDayRestToggle(idx)}
                      className="text-[10px] font-bold text-gray-400 hover:text-white underline cursor-pointer"
                    >
                      Toggle {day.restDay ? "Available" : "Rest Day"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. CLASS BATCH TIMINGS SECTION */}
            <div className="bg-[#14161D] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#10B981]" /> B. Available Class Batch Timings (GMT UTC+0)
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Configure standard class times (1st, 2nd, and 3rd Batches in GMT).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {config.batchTimings.map((batch, idx) => (
                  <div key={batch.id} className="p-4 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#0080FF]">{batch.batchName}</span>
                      <span className="text-[10px] font-bold text-gray-400">{batch.timezone}</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                        Display Timing String
                      </label>
                      <input
                        type="text"
                        value={batch.displayLabel}
                        onChange={(e) => handleBatchTimingChange(idx, "displayLabel", e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-[#14161D] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">Start Time</label>
                        <input
                          type="text"
                          value={batch.startTime}
                          onChange={(e) => handleBatchTimingChange(idx, "startTime", e.target.value)}
                          className="w-full h-9 px-2.5 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">End Time</label>
                        <input
                          type="text"
                          value={batch.endTime}
                          onChange={(e) => handleBatchTimingChange(idx, "endTime", e.target.value)}
                          className="w-full h-9 px-2.5 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. MONTHLY MEMBERSHIP PLANS, PRICING & CURRICULUM SYLLABUS SECTION */}
            <div className="bg-[#14161D] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)] flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#E50914]" /> C. Monthly Membership Pricing, Badges & Curriculum Syllabus
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Configure pricing ($25 to $85/mo), badges, and editable curriculum learning topics for 1-5 Days/Week plans.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {config.membershipPlans.map((plan, idx) => (
                  <div key={plan.daysPerWeek} className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#0080FF] text-white text-xs font-extrabold flex items-center justify-center">
                          {plan.daysPerWeek}
                        </span>
                        <span className="text-sm font-extrabold text-white">{plan.label} Plan</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
                          <span>USD:</span>
                          <input
                            type="number"
                            value={plan.monthlyPriceUSD}
                            onChange={(e) => handlePlanPriceChange(idx, "monthlyPriceUSD", parseFloat(e.target.value) || 0)}
                            className="w-20 h-8 px-2 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold text-center"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
                          <span>INR:</span>
                          <input
                            type="number"
                            value={plan.monthlyPriceINR}
                            onChange={(e) => handlePlanPriceChange(idx, "monthlyPriceINR", parseFloat(e.target.value) || 0)}
                            className="w-24 h-8 px-2 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold text-center"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
                          <span>Badge:</span>
                          <select
                            value={plan.badge || ""}
                            onChange={(e) => handlePlanPriceChange(idx, "badge", e.target.value || null)}
                            className="h-8 px-2 rounded-lg bg-[#14161D] border border-white/10 text-white text-xs font-bold"
                          >
                            <option value="">None</option>
                            <option value="MOST POPULAR">MOST POPULAR</option>
                            <option value="BEST VALUE">BEST VALUE</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Curriculum Syllabus Editor for this plan */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#0080FF]" /> Curriculum Syllabus Topics ({plan.label}):
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddPlanCurriculumItem(idx)}
                          className="px-2.5 py-1 rounded-lg bg-[#0080FF]/20 text-[#0080FF] hover:bg-[#0080FF]/30 text-[11px] font-extrabold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Topic
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {(plan.curriculum || []).map((topic, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-2 bg-[#14161D] p-1.5 rounded-xl border border-white/5">
                            <span className="w-5 h-5 rounded-full bg-[#E50914]/20 text-[#E50914] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {tIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={topic}
                              onChange={(e) => handlePlanCurriculumChange(idx, tIdx, e.target.value)}
                              className="flex-grow h-8 px-2 rounded-lg bg-[#0F1117] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#0080FF]"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeletePlanCurriculumItem(idx, tIdx)}
                              className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all cursor-pointer"
                              title="Delete Topic"
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

            {/* SAVE BUTTON CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white font-extrabold text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#0080FF]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isSaving ? "Saving System Configuration..." : "Save Schedule & Pricing Configuration"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminShell>
  );
}
