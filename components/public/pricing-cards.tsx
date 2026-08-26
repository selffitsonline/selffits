"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck, Zap } from "lucide-react";

export function PricingCards() {
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [activeTab, setActiveTab] = useState<"belt" | "fitness">("belt");

  const beltPlans = [
    {
      id: "yellow-belt",
      name: "Yellow Belt",
      subtitle: "Beginner Martial Arts",
      duration: "1 Month",
      classes: "8 Live Classes",
      priceINR: "2,999",
      priceUSD: "39",
      popular: false,
      features: [
        "8 Interactive Live Classes",
        "Zoom Classes Access",
        "Stance & Punching Foundations",
        "Form & Technique Corrections",
        "Yellow Belt Completion Cert",
      ],
    },
    {
      id: "blue-belt",
      name: "Blue Belt",
      subtitle: "Intermediate Master Tier",
      duration: "3 Months",
      classes: "24 Live Classes",
      priceINR: "7,999",
      priceUSD: "99",
      popular: true, // RECOMMENDED
      features: [
        "24 Interactive Live Classes",
        "Zoom Classes Access",
        "Kicking Combos & Self Defense",
        "Personalized Form Corrections",
        "Official Blue Belt Certification",
        "Priority Customer Support",
      ],
    },
    {
      id: "purple-belt",
      name: "Purple Belt",
      subtitle: "Advanced Martial Arts",
      duration: "6 Months",
      classes: "48 Live Classes",
      priceINR: "13,999",
      priceUSD: "179",
      popular: false,
      features: [
        "48 Interactive Live Classes",
        "Zoom Classes Access",
        "Advanced Kata & Sparring Drills",
        "1-on-1 Form Evaluation",
        "Official Purple Belt Certification",
        "Recorded Backup Access",
      ],
    },
    {
      id: "brown-belt",
      name: "Brown Belt",
      subtitle: "Elite Master Transformation",
      duration: "12 Months",
      classes: "96 Live Classes",
      priceINR: "24,999",
      priceUSD: "319",
      popular: false,
      features: [
        "96 Interactive Live Classes",
        "Zoom Classes Access",
        "Master Rank Sparring & Weaponry",
        "Complete Fitness Conditioning",
        "Official Brown Belt Certification",
        "Direct Coach Mentorship",
      ],
    },
  ];

  const fitnessPlans = [
    {
      id: "challenge-8",
      name: "8 Day Challenge",
      subtitle: "Kickstart Fitness",
      duration: "8 Days",
      classes: "8 Live Workouts",
      priceINR: "1,499",
      priceUSD: "19",
      popular: false,
      features: [
        "8 Daily Live Workout Sessions",
        "HIIT & Fat Burn Routines",
        "Basic Nutrition Checklist",
        "Live Trainer Guidance",
      ],
    },
    {
      id: "challenge-24",
      name: "24 Day Challenge",
      subtitle: "Fat Loss & Stamina",
      duration: "24 Days",
      classes: "24 Live Workouts",
      priceINR: "3,999",
      priceUSD: "49",
      popular: true,
      features: [
        "24 Daily Live Workout Sessions",
        "HIIT & Bodyweight Strength",
        "Custom Calorie & Meal Plan",
        "Weekly Progress Tracking",
        "24-Day Completion Cert",
      ],
    },
    {
      id: "transformation-96",
      name: "96 Day Transformation",
      subtitle: "Total Body Overhaul",
      duration: "96 Days",
      classes: "96 Live Workouts",
      priceINR: "13,999",
      priceUSD: "169",
      popular: false,
      features: [
        "96 Daily Live Workout Sessions",
        "Extreme Shred & Core Mastery",
        "Full Lifestyle & Diet Plan",
        "1-on-1 Coach Accountability",
        "Transformation Certificate",
      ],
    },
  ];

  const currentPlans = activeTab === "belt" ? beltPlans : fitnessPlans;

  return (
    <div className="space-y-8">
      {/* Controls: Tab Selector & Currency Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#14161D] p-3 rounded-2xl border border-white/10 max-w-2xl mx-auto">
        {/* Category Tab */}
        <div className="flex items-center gap-1 bg-[#0F1117] p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("belt")}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "belt"
                ? "bg-[#E50914] text-white shadow-md shadow-[#E50914]/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Martial Arts Belts
          </button>
          <button
            onClick={() => setActiveTab("fitness")}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "fitness"
                ? "bg-[#E50914] text-white shadow-md shadow-[#E50914]/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Fitness Challenges
          </button>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
          <span>Currency:</span>
          <div className="flex items-center bg-[#0F1117] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setCurrency("INR")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currency === "INR"
                  ? "bg-[#0080FF] text-white font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🇮🇳 INR (₹)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currency === "USD"
                  ? "bg-[#0080FF] text-white font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🌐 USD ($)
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${currentPlans.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-6 items-stretch`}>
        {currentPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] ${
              plan.popular
                ? "bg-gradient-to-b from-[#1E2330] to-[#14161D] border-2 border-[#E50914] shadow-2xl shadow-[#E50914]/20"
                : "bg-[#14161D] border border-white/10 hover:border-white/20"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" />
                Most Popular Choice
              </div>
            )}

            <div>
              <div className="mb-4">
                <h3 className="text-xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
                  {plan.name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{plan.subtitle}</p>
              </div>

              <div className="my-6 pb-6 border-b border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-[family-name:var(--font-outfit)]">
                    {currency === "INR" ? `₹${plan.priceINR}` : `$${plan.priceUSD}`}
                  </span>
                  <span className="text-xs text-gray-400">/ {plan.duration}</span>
                </div>
                <span className="inline-block mt-2 px-2.5 py-1 rounded-md bg-[#0080FF]/15 text-[#0080FF] text-xs font-semibold">
                  {plan.classes}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                    <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={`/checkout?plan=${plan.id}`}
              className={`w-full py-3 rounded-xl text-center font-bold text-sm transition-all shadow-md cursor-pointer block ${
                plan.popular
                  ? "bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white hover:opacity-95 shadow-[#E50914]/30"
                  : "bg-[#1F2937] text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              Enroll Now
            </Link>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#10B981]" />
        <span>100% Secure Checkout • Instant Enrollment Confirmation</span>
      </div>
    </div>
  );
}
