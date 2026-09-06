"use client";

import React, { useState, useEffect } from "react";
import {
  CentralScheduleConfig,
  DEFAULT_CENTRAL_SCHEDULE_CONFIG,
  DEFAULT_MEMBERSHIP_PLANS,
  getDefaultScheduleConfig,
  calculateMonthlyPrice,
} from "@/lib/schedule-config";
import { getScheduleConfigAction } from "@/actions/schedule-config.actions";
import { Calendar, Clock, Check, Zap, AlertCircle, ShieldCheck, Sparkles, Lock, BookOpen } from "lucide-react";

export interface StudentScheduleSelectionState {
  daysPerWeek: number;
  selectedDays: string[];
  selectedBatch: string;
  monthlyPriceUSD: number;
}

export interface StudentScheduleSelectorProps {
  category?: string;
  group?: string;
  title?: string;
  initialDaysPerWeek?: number;
  initialSelectedDays?: string[];
  initialSelectedBatch?: string;
  onSelectionChange?: (state: StudentScheduleSelectionState) => void;
  showCheckoutCta?: boolean;
  onCheckoutSubmit?: (state: StudentScheduleSelectionState) => void;
}

export function StudentScheduleSelector({
  category = "mixed-martial-arts",
  group = "kids",
  title = "Mixed Martial Arts",
  initialDaysPerWeek = 1,
  initialSelectedDays = ["Sunday"],
  initialSelectedBatch = "2nd Batch — 02:30 PM to 03:30 PM (GMT)",
  onSelectionChange,
  showCheckoutCta = false,
  onCheckoutSubmit,
}: StudentScheduleSelectorProps) {
  const [config, setConfig] = useState<CentralScheduleConfig>(() => getDefaultScheduleConfig(category, group));
  const [daysPerWeek, setDaysPerWeek] = useState<number>(initialDaysPerWeek);
  const [selectedDays, setSelectedDays] = useState<string[]>(initialSelectedDays);
  const [selectedBatch, setSelectedBatch] = useState<string>(initialSelectedBatch);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await getScheduleConfigAction(category, group);
        if (res.success && res.config) {
          setConfig(res.config);
        } else {
          setConfig(getDefaultScheduleConfig(category, group));
        }
      } catch (err) {
        console.error("Failed to load central schedule config:", err);
        setConfig(getDefaultScheduleConfig(category, group));
      }
    }
    loadConfig();
  }, [category, group]);

  // Available days vs Rest Days
  const availableTrainingDays = (config.trainingDays || DEFAULT_CENTRAL_SCHEDULE_CONFIG.trainingDays).filter(
    (d) => d.activeStatus !== false
  );

  const availableBatchTimings = (config.batchTimings || DEFAULT_CENTRAL_SCHEDULE_CONFIG.batchTimings).filter(
    (b) => b.activeStatus !== false
  );

  const membershipPlans = (config.membershipPlans || DEFAULT_CENTRAL_SCHEDULE_CONFIG.membershipPlans).filter(
    (p) => p.activeStatus !== false
  );

  // Active Plan Curriculum Topics
  const activePlanObj = membershipPlans.find((p) => p.daysPerWeek === daysPerWeek);
  const activeCurriculum =
    activePlanObj?.curriculum ||
    DEFAULT_MEMBERSHIP_PLANS.find((p) => p.daysPerWeek === daysPerWeek)?.curriculum || [
      "Breathing & meditation exercises",
      "Warm-up & full joint flexibility routines",
      "Martial arts fundamental stances & kicks",
      "Core strength conditioning & self-defense techniques",
    ];

  // When frequency changes to 5, auto-select all 5 available training days
  const handleFrequencyChange = (freq: number) => {
    setDaysPerWeek(freq);

    const selectableDaysList = availableTrainingDays
      .filter((d) => !d.restDay && d.selectable)
      .map((d) => d.dayName);

    if (freq === 5) {
      setSelectedDays(selectableDaysList);
    } else {
      const currentValid = selectedDays.filter((d) => selectableDaysList.includes(d));
      if (currentValid.length > freq) {
        setSelectedDays(currentValid.slice(0, freq));
      } else if (currentValid.length < freq) {
        const needed = freq - currentValid.length;
        const availableToPick = selectableDaysList.filter((d) => !currentValid.includes(d));
        setSelectedDays([...currentValid, ...availableToPick.slice(0, needed)]);
      } else {
        setSelectedDays(currentValid);
      }
    }
  };

  const handleDayToggle = (dayName: string, isRestDay: boolean) => {
    if (isRestDay) return;

    if (daysPerWeek === 5) {
      return;
    }

    if (selectedDays.includes(dayName)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayName));
      }
    } else {
      if (selectedDays.length < daysPerWeek) {
        setSelectedDays([...selectedDays, dayName]);
      } else {
        const newSelection = [...selectedDays.slice(1), dayName];
        setSelectedDays(newSelection);
      }
    }
  };

  const currentPricing = calculateMonthlyPrice(daysPerWeek, membershipPlans);

  // Emit selection state changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange({
        daysPerWeek,
        selectedDays,
        selectedBatch,
        monthlyPriceUSD: currentPricing.priceUSD,
      });
    }
  }, [daysPerWeek, selectedDays, selectedBatch, currentPricing.priceUSD]);

  const isSelectionValid = selectedDays.length === daysPerWeek && !!selectedBatch;

  return (
    <div className="space-y-8 bg-[#14161D] border border-white/15 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E50914] px-2.5 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/30">
            Interactive Schedule Builder
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)] mt-2">
            {title}
          </h3>
        </div>
      </div>

      {/* STEP 1: SELECT MEMBERSHIP FREQUENCY */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
          <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-gray-200 flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-[#E50914] text-white text-xs font-black flex items-center justify-center shrink-0 shadow-md">
              1
            </span>
            <span>Select Weekly Training Frequency</span>
          </label>
          <span className="text-xs font-bold text-[#0080FF] pl-8 sm:pl-0">
            Selected: {daysPerWeek} {daysPerWeek === 1 ? "Day" : "Days"} / Week
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
          {membershipPlans.map((plan) => {
            const isSelected = daysPerWeek === plan.daysPerWeek;
            const priceLabel = `$${plan.monthlyPriceUSD}`;

            return (
              <button
                key={plan.daysPerWeek}
                type="button"
                onClick={() => handleFrequencyChange(plan.daysPerWeek)}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all text-center flex flex-col justify-between cursor-pointer min-h-[110px] sm:min-h-[120px] ${
                  isSelected
                    ? "bg-gradient-to-b from-[#1E2330] to-[#141722] border-[#E50914] text-white shadow-xl shadow-[#E50914]/25 ring-2 ring-[#E50914]"
                    : "bg-[#0F1117] border-white/10 text-gray-300 hover:border-white/20 hover:text-white"
                }`}
              >
                {/* Badge area inside container for 100% uniform tops */}
                <div className="flex items-center justify-center min-h-[20px]">
                  {plan.badge ? (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm ${
                        plan.badge === "MOST POPULAR"
                          ? "bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white"
                          : "bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider opacity-0 select-none pointer-events-none">
                      DEFAULT
                    </span>
                  )}
                </div>

                <div className="my-1">
                  <span className="block text-xs sm:text-sm font-black">{plan.label}</span>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <span className="text-base sm:text-lg font-black text-white font-[family-name:var(--font-outfit)]">
                    {priceLabel}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-medium">/ month</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: SELECT REQUIRED WEEKLY TRAINING DAYS */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
          <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-gray-200 flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-[#E50914] text-white text-xs font-black flex items-center justify-center shrink-0 shadow-md">
              2
            </span>
            <span>Select {daysPerWeek} Training {daysPerWeek === 1 ? "Day" : "Days"}</span>
          </label>
          <span className="text-xs font-semibold text-gray-400 pl-8 sm:pl-0">
            Selected <span className="text-white font-bold">{selectedDays.length}</span> of{" "}
            <span className="text-white font-bold">{daysPerWeek}</span> required
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5">
          {availableTrainingDays.map((day) => {
            const isSelected = selectedDays.includes(day.dayName);
            const isRest = day.restDay || !day.selectable;

            return (
              <button
                key={day.dayName}
                type="button"
                disabled={isRest}
                onClick={() => handleDayToggle(day.dayName, isRest)}
                className={`h-20 p-2.5 sm:p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isRest
                    ? "bg-red-500/10 border-red-500/25 text-red-300 cursor-not-allowed"
                    : isSelected
                    ? "bg-[#0080FF] border-[#0080FF] text-white font-extrabold shadow-lg shadow-[#0080FF]/25 cursor-pointer ring-1 ring-[#0080FF]"
                    : "bg-[#0F1117] border-white/10 text-gray-300 hover:border-white/25 hover:text-white cursor-pointer"
                }`}
              >
                <span className="text-xs sm:text-sm font-extrabold">{day.dayName}</span>
                {isRest ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 whitespace-nowrap">
                    REST DAY
                  </span>
                ) : (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1 ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                    {isSelected ? "Selected" : "Available"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectedDays.length < daysPerWeek && (
          <p className="text-xs text-amber-400 font-semibold flex items-center gap-1 mt-1 pl-1">
            <AlertCircle className="w-3.5 h-3.5" /> Please select {daysPerWeek - selectedDays.length} more training day(s).
          </p>
        )}
      </div>

      {/* STEP 3: SELECT PREFERRED BATCH TIMING */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-gray-200 flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-[#E50914] text-white text-xs font-black flex items-center justify-center shrink-0 shadow-md">
              3
            </span>
            <span>Select Preferred Class Batch Timing (GMT UTC+0)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {availableBatchTimings.map((batch) => {
            const fullBatchLabel = `${batch.batchName} — ${batch.displayLabel} (${batch.timezone})`;
            const isSelected = selectedBatch.includes(batch.batchName) || selectedBatch === fullBatchLabel;

            return (
              <button
                key={batch.id}
                type="button"
                onClick={() => setSelectedBatch(fullBatchLabel)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-b from-[#1E2330] to-[#141722] border-[#0080FF] text-white shadow-md shadow-[#0080FF]/20 ring-1 ring-[#0080FF]"
                    : "bg-[#0F1117] border-white/10 text-gray-300 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#0080FF]">{batch.batchName}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#0080FF]" />}
                </div>

                <div className="mt-2 space-y-0.5">
                  <span className="text-sm font-extrabold text-white font-[family-name:var(--font-outfit)] block">
                    {batch.displayLabel}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400 block">{batch.timezone}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 4: CURRICULUM & LEARNING SYLLABUS BREAKDOWN */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
          <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-gray-200 flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-[#E50914] text-white text-xs font-black flex items-center justify-center shrink-0 shadow-md">
              4
            </span>
            <span>Curriculum & Learning Syllabus ({daysPerWeek} {daysPerWeek === 1 ? "Day" : "Days"} / Wk Plan)</span>
          </label>
          <span className="text-xs font-bold text-[#0080FF] flex items-center gap-1 pl-8 sm:pl-0">
            <BookOpen className="w-3.5 h-3.5" /> Verified Academy Curriculum
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">
              Included Topics in {daysPerWeek} {daysPerWeek === 1 ? "Day" : "Days"} / Week Tier:
            </span>
            <span className="text-[10px] font-bold text-gray-400">Zoom Live Online Classes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {activeCurriculum.map((topic, tIdx) => (
              <div key={tIdx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#14161D] border border-white/5 text-xs text-gray-200 font-medium">
                <span className="w-5 h-5 rounded-full bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {tIdx + 1}
                </span>
                <span>{topic}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 5: SELECTION SUMMARY PREVIEW */}
      <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/15 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0080FF]" /> Enrollment Schedule Summary
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[10px] font-extrabold uppercase tracking-wider">
            Auto-Calculated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-gray-400 font-semibold block">Selected Membership Plan:</span>
            <span className="font-extrabold text-white text-sm block">
              {daysPerWeek} {daysPerWeek === 1 ? "Day" : "Days"} / Week
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 font-semibold block">Selected Training Days:</span>
            <span className="font-extrabold text-[#0080FF] text-sm block">
              {selectedDays.length > 0 ? selectedDays.join(", ") : "None Selected"}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 font-semibold block">Selected Batch Timing:</span>
            <span className="font-extrabold text-white text-sm block">
              {selectedBatch || "Not Selected"}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 font-semibold block">Monthly Price:</span>
            <span className="font-black text-2xl text-white font-[family-name:var(--font-outfit)] block">
              ${currentPricing.priceUSD}
              <span className="text-xs text-gray-400 font-normal"> / month</span>
            </span>
          </div>
        </div>

        {showCheckoutCta && onCheckoutSubmit && (
          <div className="pt-2">
            <button
              type="button"
              disabled={!isSelectionValid}
              onClick={() =>
                onCheckoutSubmit({
                  daysPerWeek,
                  selectedDays,
                  selectedBatch,
                  monthlyPriceUSD: currentPricing.priceUSD,
                })
              }
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" /> Proceed to Enrollment (${currentPricing.priceUSD})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
