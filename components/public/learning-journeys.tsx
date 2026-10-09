"use client";

import React, { useState } from "react";
import { Sparkles, Award, Flame } from "lucide-react";

export interface BeltItem {
  id: string;
  name: string;
  subtitle?: string;
  isEnabled?: boolean;
  syllabus?: string[];
}

export interface BeltSyllabusData {
  headingBadge?: string;
  headingTitle?: string;
  headingSubtitle?: string;
  belts?: BeltItem[];
}

export interface FitnessJourneyData {
  headingBadge?: string;
  headingTitle?: string;
  headingSubtitle?: string;
  points?: string[];
}

export const DEFAULT_BELTS: BeltItem[] = [
  {
    id: "white_belt",
    name: "White Belt",
    subtitle: "Foundations & Fundamental Stances",
    isEnabled: true,
    syllabus: [
      "Breathing & mind-body focus exercises",
      "Full joint warm-up & flexibility routines",
      "Martial arts fundamental stances & front kick mechanics",
      "Core strength conditioning & basic self-defense blocks",
      "Dojo etiquette, respect, and discipline basics",
    ],
  },
  {
    id: "yellow_belt",
    name: "Yellow Belt",
    subtitle: "Striking Foundations & Footwork",
    isEnabled: true,
    syllabus: [
      "Jab-Cross punch combination & guard positioning",
      "Roundhouse kick techniques & target accuracy",
      "Basic evasion, ducking, and footwork drills",
      "Upper body blocks & counter-attack timing",
      "Stamina building & high-intensity core sets",
    ],
  },
  {
    id: "green_belt",
    name: "Green Belt",
    subtitle: "Intermediate Striking & Defense",
    isEnabled: true,
    syllabus: [
      "Side kicks, hook kicks & dynamic leg flexibility",
      "Combination striking & distance management",
      "Intermediate wrist escape & release self-defense maneuvers",
      "Reaction time drills & counter-punching precision",
      "Core stability & balance endurance exercises",
    ],
  },
  {
    id: "blue_belt",
    name: "Blue Belt",
    subtitle: "Advanced Form & Sparring Tactics",
    isEnabled: true,
    syllabus: [
      "Spinning back kick & jump kick execution",
      "Advanced defense counters & sweep techniques",
      "Close-range elbow and knee strike combinations",
      "Multi-attacker defense awareness & tactical positioning",
      "Mental resilience & competitive focus conditioning",
    ],
  },
  {
    id: "brown_belt",
    name: "Brown Belt",
    subtitle: "Mastery Level Combat & Control",
    isEnabled: true,
    syllabus: [
      "Precision combination chaining & fluid movement mastery",
      "Joint lock defense & advanced takedown prevention",
      "Speed, power, and kinetic energy striking mechanics",
      "Leadership, junior mentoring & assistant instructor drills",
      "Intensive full-body endurance & power conditioning",
    ],
  },
  {
    id: "black_belt",
    name: "Black Belt",
    subtitle: "Black Belt Excellence & Syllabus Graduation",
    isEnabled: true,
    syllabus: [
      "Full martial arts curriculum mastery & flawless form execution",
      "Real-world situational self-defense & rapid neutralizing drills",
      "Advanced teaching methodology & stance evaluation techniques",
      "Official black belt examination & graduation syllabus completion",
      "Lifelong discipline, philosophy, and academy ambassador leadership",
    ],
  },
];

export const DEFAULT_FITNESS_JOURNEY: FitnessJourneyData = {
  headingBadge: "WEIGHT MANAGEMENT SYLLABUS",
  headingTitle: "Your Weight Management Journey",
  headingSubtitle:
    "Explore the core fitness, HIIT cardio, muscle endurance, and body transformation modules covered in our Weight Management program.",
  points: [
    "Full-body metabolic warm-up & posture alignment routines",
    "High-Intensity Interval Training (HIIT) for maximum fat burn & stamina",
    "Core strength, abdominal shred & posture stabilization drills",
    "Bodyweight resistance & progressive muscular endurance exercises",
    "Targeted waistline, thigh, and arm toning workouts",
    "Cardiovascular endurance building & active recovery techniques",
    "Nutritional guidelines, hydration habits & daily wellness tracking",
  ],
};

export function getBeltStyle(name: string) {
  const n = name.toLowerCase();
  if (n.includes("yellow")) return { bg: "bg-amber-400/20", text: "text-amber-300", border: "border-amber-400/50" };
  if (n.includes("green")) return { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/50" };
  if (n.includes("blue")) return { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/50" };
  if (n.includes("brown")) return { bg: "bg-amber-800/30", text: "text-amber-400", border: "border-amber-700/60" };
  if (n.includes("black")) return { bg: "bg-red-950/50", text: "text-red-400", border: "border-red-600/60" };
  return { bg: "bg-gray-200/20", text: "text-white", border: "border-gray-300/40" };
}

export function MartialArtsJourneySection({ data }: { data?: BeltSyllabusData | null }) {
  const beltsList = data?.belts && data.belts.length > 0 ? data.belts : DEFAULT_BELTS;
  const activeBelts = beltsList.filter((b) => b.isEnabled !== false);
  const [activeBeltId, setActiveBeltId] = useState<string>(() => activeBelts[0]?.id || "white_belt");
  const selectedBelt = activeBelts.find((b) => b.id === activeBeltId) || activeBelts[0] || beltsList[0];
  const selectedStyle = selectedBelt ? getBeltStyle(selectedBelt.name) : getBeltStyle("White Belt");

  return (
    <div className="max-w-7xl mx-auto space-y-12 relative z-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E50914]/15 border border-[#E50914]/40 text-xs font-black uppercase tracking-widest text-[#E50914] shadow-lg">
          <Sparkles className="w-3.5 h-3.5" />
          {data?.headingBadge || "BELT PROGRESSION SYLLABUS"}
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-[family-name:var(--font-outfit)] tracking-tight text-white">
          {data?.headingTitle || "Your Martial Arts Learning Journey"}
        </h2>
        <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
          {data?.headingSubtitle ||
            "Explore the skills, techniques, and syllabus covered at each belt progression rank from White Belt to Black Belt."}
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 w-full">
          {activeBelts.map((belt) => {
            const isSelected = selectedBelt?.id === belt.id;
            const style = getBeltStyle(belt.name);

            return (
              <button
                key={belt.id}
                type="button"
                onClick={() => setActiveBeltId(belt.id)}
                className={`px-2 sm:px-2.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-center sm:text-left cursor-pointer ${
                  isSelected
                    ? `${style.bg} ${style.border} text-white shadow-xl ring-2 ring-white/20`
                    : "bg-[#14161D] border-white/10 text-gray-400 hover:text-white hover:border-white/25"
                }`}
              >
                <Award className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isSelected ? style.text : "text-gray-400"}`} />
                <span className={`block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider whitespace-nowrap ${isSelected ? style.text : "text-gray-200"}`}>
                  {belt.name}
                </span>
              </button>
            );
          })}
        </div>

        {selectedBelt && (
          <div className="w-full bg-[#14161D] border border-white/15 rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${selectedStyle.bg} ${selectedStyle.border} ${selectedStyle.text}`}>
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
                    {selectedBelt.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-gray-400 mt-0.5">
                    {selectedBelt.subtitle || "Techniques & Learning Syllabus"}
                  </p>
                </div>
              </div>

              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border self-start sm:self-auto inline-flex items-center justify-center shrink-0 ${selectedStyle.bg} ${selectedStyle.text} ${selectedStyle.border}`}>
                Official Belt Level
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {selectedBelt.syllabus && selectedBelt.syllabus.length > 0 ? (
                <div className="space-y-3">
                  {selectedBelt.syllabus.map((topic, tIdx) => (
                    <div
                      key={tIdx}
                      className="flex items-start gap-3 text-xs sm:text-sm text-gray-200 font-medium leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-md bg-[#E50914]/15 text-[#E50914] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        {tIdx + 1}
                      </span>
                      <span className="flex-1">{topic}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No syllabus points configured for this belt level.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function WeightManagementJourneySection({ data }: { data?: FitnessJourneyData | null }) {
  const fitnessData = data || DEFAULT_FITNESS_JOURNEY;
  const pointsList = fitnessData.points || [];

  return (
    <div className="max-w-7xl mx-auto space-y-12 relative z-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E50914]/15 border border-[#E50914]/40 text-xs font-black uppercase tracking-widest text-[#E50914] shadow-lg">
          <Flame className="w-3.5 h-3.5" />
          {fitnessData.headingBadge || "WEIGHT MANAGEMENT SYLLABUS"}
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-[family-name:var(--font-outfit)] tracking-tight text-white">
          {fitnessData.headingTitle || "Your Weight Management Journey"}
        </h2>
        <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
          {fitnessData.headingSubtitle ||
            "Explore the core fitness, HIIT cardio, muscle endurance, and body transformation modules covered in our Weight Management program."}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="w-full bg-[#14161D] border border-white/15 rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center border bg-[#E50914]/15 border-[#E50914]/40 text-[#E50914] shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
                  Fitness & Weight Management
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-gray-400 mt-0.5">
                  Curriculum & Daily Fitness Modules
                </p>
              </div>
            </div>

            <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-[#E50914]/15 text-[#E50914] border-[#E50914]/40 self-start sm:self-auto inline-flex items-center justify-center shrink-0">
              Fat Loss & HIIT Track
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {pointsList.length > 0 ? (
              <div className="space-y-3">
                {pointsList.map((topic, tIdx) => (
                  <div
                    key={tIdx}
                    className="flex items-start gap-3 text-xs sm:text-sm text-gray-200 font-medium leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-md bg-[#E50914]/15 text-[#E50914] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {tIdx + 1}
                    </span>
                    <span className="flex-1">{topic}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No weight management syllabus points configured.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LearningJourneys({
  beltSyllabusData,
  fitnessJourneyData,
  className = "py-16 sm:py-24 bg-[#0A0B0E] border-b border-white/10 px-4 relative overflow-hidden space-y-16 sm:space-y-20",
}: {
  beltSyllabusData?: BeltSyllabusData | null;
  fitnessJourneyData?: FitnessJourneyData | null;
  className?: string;
}) {
  return (
    <section className={className}>
      <MartialArtsJourneySection data={beltSyllabusData} />
      <WeightManagementJourneySection data={fitnessJourneyData} />
    </section>
  );
}
