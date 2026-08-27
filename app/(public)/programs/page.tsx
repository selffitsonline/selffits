"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { getAdminProgramsCatalogAction } from "@/actions/admin.actions";
import {
  Video,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Users,
  Flame,
  Check,
  Sparkles,
  Sun,
  Moon,
  Tag,
} from "lucide-react";

type MainTab = "mma" | "hiit";
type MmaCategory = "kids" | "adults" | "ladies";
type Currency = "INR" | "USD";

interface MmaCourse {
  id: string;
  planId: string;
  title: string;
  belt: string;
  beltColor: "yellow" | "blue" | "purple" | "brown";
  priceINR: string;
  priceUSD: string;
  provision: string;
  inclusions: string;
  platform: string;
  classInfo: string;
  curriculum: string[];
  schedule: {
    classesWeekly: string;
    duration: string;
    availableDays: string[];
    availableTimings?: string[];
    morningBatch?: string[];
    eveningBatch?: string[];
  };
}

interface HiitChallenge {
  id: string;
  planId: string;
  title: string;
  priceINR: string;
  priceUSD: string;
  inclusions: string;
  platform: string;
  classInfo: string;
  program: string[];
  schedule: {
    classesWeekly: string;
    availableDays?: string[];
    timing: string;
  };
}

const MMA_DATA: Record<
  MmaCategory,
  {
    age: string;
    categoryTitle: string;
    description: string;
    courses: MmaCourse[];
  }
> = {
  kids: {
    age: "Age: 08 Years to 20 Years",
    categoryTitle: "Kids Martial Arts",
    description:
      "Structured virtual martial arts progression teaching stances, kicks, discipline, and core techniques for young learners.",
    courses: [
      {
        id: "mma-kids-1m",
        planId: "yellow-belt",
        title: "1 Month Course — Yellow Belt",
        belt: "Yellow Belt",
        beltColor: "yellow",
        priceINR: "2,999",
        priceUSD: "39",
        provision: "Certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 8 days",
        curriculum: [
          "Breathing exercises for beginners",
          "Warm-up exercises for beginners",
          "All joints exercises for beginners",
          "Stretching exercises for beginners",
          "Martial arts basic stances for beginners",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "45 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          availableTimings: [
            "03:30 PM to 04:15 PM (GMT)",
            "05:15 PM to 06:00 PM (GMT)",
          ],
        },
      },
      {
        id: "mma-kids-3m",
        planId: "blue-belt",
        title: "3 Months Course — Blue Belt",
        belt: "Blue Belt",
        beltColor: "blue",
        priceINR: "7,999",
        priceUSD: "99",
        provision: "Certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 24 days",
        curriculum: [
          "Breathing exercises for intermediate level",
          "Dynamic warm-up",
          "All joints exercises for intermediate level",
          "Stretching exercises for intermediate level",
          "Martial arts basic movements for intermediate level",
          "Martial arts basic blocks, kicks, punches, and push-ups",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "60 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          availableTimings: [
            "03:30 PM to 04:30 PM (GMT)",
            "05:15 PM to 06:15 PM (GMT)",
          ],
        },
      },
      {
        id: "mma-kids-6m",
        planId: "purple-belt",
        title: "6 Month Course — Purple Belt",
        belt: "Purple Belt",
        beltColor: "purple",
        priceINR: "13,999",
        priceUSD: "179",
        provision: "Belt and certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 48 days",
        curriculum: [
          "Advanced level meditation",
          "Advanced level breathing",
          "5-minute cardio workout",
          "Advanced level martial arts movements",
          "Animal stances, catches, blocks, and attacks",
          "Basic level martial arts fighting",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "90 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          availableTimings: [
            "03:30 PM to 05:00 PM (GMT)",
            "05:15 PM to 06:45 PM (GMT)",
          ],
        },
      },
      {
        id: "mma-kids-12m",
        planId: "brown-belt",
        title: "12 Months Course — Brown Belt",
        belt: "Brown Belt",
        beltColor: "brown",
        priceINR: "24,999",
        priceUSD: "319",
        provision: "Belt and certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 96 days",
        curriculum: [
          "Master level meditation",
          "Master level breathing",
          "10-minute cardio workout",
          "Master level animal stances, catches, blocks, and attacks",
          "Kung-fu tiger, eagle, and snake movements",
          "Advanced level martial arts fighting",
          "Basic level martial arts weapons",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "90 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          availableTimings: [
            "03:30 PM to 05:00 PM (GMT)",
            "05:15 PM to 06:45 PM (GMT)",
          ],
        },
      },
    ],
  },
  adults: {
    age: "Age: 21 Years+",
    categoryTitle: "Adults Mix Martial Arts",
    description:
      "Comprehensive martial arts for adults. Enhance overall fitness, practical striking, defense maneuvers, and belt advancement.",
    courses: [
      {
        id: "mma-adults-1m",
        planId: "yellow-belt",
        title: "1 Month Course — Yellow Belt",
        belt: "Yellow Belt",
        beltColor: "yellow",
        priceINR: "2,999",
        priceUSD: "39",
        provision: "Certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 8 days",
        curriculum: [
          "Breathing exercises for beginners",
          "Warm-up exercises for beginners",
          "All joints exercises for beginners",
          "Stretching exercises for beginners",
          "Martial arts basic stances for beginners",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "45 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: [
            "04:30 AM to 05:15 AM (GMT)",
            "06:00 AM to 06:45 AM (GMT)",
          ],
          eveningBatch: [
            "07:00 PM to 07:45 PM (GMT)",
            "08:30 PM to 09:15 PM (GMT)",
          ],
        },
      },
      {
        id: "mma-adults-3m",
        planId: "blue-belt",
        title: "3 Months Course — Blue Belt",
        belt: "Blue Belt",
        beltColor: "blue",
        priceINR: "7,999",
        priceUSD: "99",
        provision: "Certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 24 days",
        curriculum: [
          "Breathing exercises for intermediate level",
          "Dynamic warm-up",
          "All joints exercises for intermediate level",
          "Stretching exercises for intermediate level",
          "Martial arts basic movements for intermediate level",
          "Martial arts basic blocks, kicks, punches, and push-ups",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "60 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: [
            "04:30 AM to 05:30 AM (GMT)",
            "06:00 AM to 07:00 AM (GMT)",
          ],
          eveningBatch: [
            "07:00 PM to 08:00 PM (GMT)",
            "08:30 PM to 09:30 PM (GMT)",
          ],
        },
      },
      {
        id: "mma-adults-6m",
        planId: "purple-belt",
        title: "6 Month Course — Purple Belt",
        belt: "Purple Belt",
        beltColor: "purple",
        priceINR: "13,999",
        priceUSD: "179",
        provision: "Belt and certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 48 days",
        curriculum: [
          "Advanced level meditation",
          "Advanced level breathing",
          "5-minute cardio workout",
          "Advanced level martial arts movements",
          "Animal stances, catches, blocks, and attacks",
          "Basic level martial arts fighting",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "90 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: [
            "04:30 AM to 06:00 AM (GMT)",
            "06:00 AM to 07:30 AM (GMT)",
          ],
          eveningBatch: [
            "07:00 PM to 08:30 PM (GMT)",
            "08:30 PM to 10:00 PM (GMT)",
          ],
        },
      },
      {
        id: "mma-adults-12m",
        planId: "brown-belt",
        title: "12 Months Course — Brown Belt",
        belt: "Brown Belt",
        beltColor: "brown",
        priceINR: "24,999",
        priceUSD: "319",
        provision: "Belt and certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 96 days",
        curriculum: [
          "Master level meditation",
          "Master level breathing",
          "10-minute cardio workout",
          "Master level animal stances, catches, blocks, and attacks",
          "Kung-fu tiger, eagle, and snake movements",
          "Advanced level martial arts fighting",
          "Basic level martial arts weapons",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "90 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: [
            "04:30 AM to 06:00 AM (GMT)",
            "06:00 AM to 07:30 AM (GMT)",
          ],
          eveningBatch: [
            "07:00 PM to 08:30 PM (GMT)",
            "08:30 PM to 10:00 PM (GMT)",
          ],
        },
      },
    ],
  },
  ladies: {
    age: "Age: 21 Years+",
    categoryTitle: "Ladies Only Martial Arts",
    description:
      "Exclusive female-only online martial arts sessions focusing on self-defense, core strength, toning, and personal safety.",
    courses: [
      {
        id: "mma-ladies-1m",
        planId: "yellow-belt",
        title: "1 Month Course — Yellow Belt",
        belt: "Yellow Belt",
        beltColor: "yellow",
        priceINR: "2,999",
        priceUSD: "39",
        provision: "Certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 8 days",
        curriculum: [
          "Breathing exercises for beginners",
          "Warm-up exercises for beginners",
          "All joints exercises for beginners",
          "Stretching exercises for beginners",
          "Martial arts basic stances for beginners",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "45 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: [
            "08:00 AM to 08:45 AM (GMT)",
            "09:30 AM to 10:15 AM (GMT)",
          ],
          eveningBatch: [
            "07:00 PM to 07:45 PM (GMT)",
            "08:30 PM to 09:15 PM (GMT)",
          ],
        },
      },
      {
        id: "mma-ladies-3m",
        planId: "blue-belt",
        title: "3 Months Course — Blue Belt",
        belt: "Blue Belt",
        beltColor: "blue",
        priceINR: "7,999",
        priceUSD: "99",
        provision: "Certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 24 days",
        curriculum: [
          "Breathing exercises for intermediate level",
          "Dynamic warm-up",
          "All joints exercises for intermediate level",
          "Stretching exercises for intermediate level",
          "Martial arts basic movements for intermediate level",
          "Martial arts basic blocks, kicks, punches, and push-ups",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "60 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: [
            "08:00 AM to 09:00 AM (GMT)",
            "09:30 AM to 10:30 AM (GMT)",
          ],
          eveningBatch: [
            "07:00 PM to 08:00 PM (GMT)",
            "08:30 PM to 09:30 PM (GMT)",
          ],
        },
      },
      {
        id: "mma-ladies-6m",
        planId: "purple-belt",
        title: "6 Month Course — Purple Belt",
        belt: "Purple Belt",
        beltColor: "purple",
        priceINR: "13,999",
        priceUSD: "179",
        provision: "Belt and certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 48 days",
        curriculum: [
          "Advanced level meditation",
          "Advanced level breathing",
          "5-minute cardio workout",
          "Advanced level martial arts movements",
          "Animal stances, catches, blocks, and attacks",
          "Basic level martial arts fighting",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "90 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: [
            "08:00 AM to 09:30 AM (GMT)",
            "09:30 AM to 11:00 AM (GMT)",
          ],
          eveningBatch: [
            "07:00 PM to 08:30 PM (GMT)",
            "08:30 PM to 10:00 PM (GMT)",
          ],
        },
      },
      {
        id: "mma-ladies-12m",
        planId: "brown-belt",
        title: "12 Months Course — Brown Belt",
        belt: "Brown Belt",
        beltColor: "brown",
        priceINR: "24,999",
        priceUSD: "319",
        provision: "Belt and certificate will be provided.",
        inclusions: "Everything listed below is included.",
        platform: "Zoom Classes",
        classInfo: "1-hour online class — 96 days",
        curriculum: [
          "Master level meditation",
          "Master level breathing",
          "10-minute cardio workout",
          "Master level animal stances, catches, blocks, and attacks",
          "Kung-fu tiger, eagle, and snake movements",
          "Advanced level martial arts fighting",
          "Basic level martial arts weapons",
        ],
        schedule: {
          classesWeekly: "2 days",
          duration: "90 minutes",
          availableDays: ["Sunday", "Wednesday", "Saturday"],
          morningBatch: [
            "08:00 AM to 09:30 AM (GMT)",
            "09:30 AM to 11:00 AM (GMT)",
          ],
          eveningBatch: [
            "07:00 PM to 08:30 PM (GMT)",
            "08:30 PM to 10:00 PM (GMT)",
          ],
        },
      },
    ],
  },
};

const HIIT_DATA: HiitChallenge[] = [
  {
    id: "hiit-8d",
    planId: "challenge-8",
    title: "8 Days Challenge for Kids",
    priceINR: "1,499",
    priceUSD: "19",
    inclusions: "Everything listed below is included.",
    platform: "Zoom Classes",
    classInfo: "1-hour online class — 8 days",
    program: [
      "Advanced level meditation and breathing exercises",
      "Light and easy warm-up sessions",
      "2 days quick full body dynamic workout",
      "3 days back-to-back progressive challenge",
      "3 days high-volume fat-burning and strengthening challenge",
    ],
    schedule: {
      classesWeekly: "2 days",
      availableDays: ["Sunday", "Wednesday"],
      timing: "03:30 PM to 04:30 PM (GMT)",
    },
  },
  {
    id: "hiit-24d",
    planId: "challenge-24",
    title: "24 Days Challenge for Kids",
    priceINR: "3,999",
    priceUSD: "49",
    inclusions: "Everything listed below is included.",
    platform: "Zoom Classes",
    classInfo: "1-hour online class — 24 days",
    program: [
      "Advanced level meditation and breathing exercises",
      "Light and easy warm-up sessions",
      "2 days quick full body dynamic workout",
      "3 days back-to-back progressive challenge",
      "3 days high-volume fat-burning and strengthening challenge",
      "8 days fat loss and cardio workouts",
      "8 days intense calorie-burning workouts",
    ],
    schedule: {
      classesWeekly: "2 days",
      timing: "03:30 PM to 04:30 PM (GMT)",
    },
  },
  {
    id: "hiit-48d",
    planId: "challenge-48",
    title: "48 Days Challenge for Kids",
    priceINR: "7,999",
    priceUSD: "99",
    inclusions: "Everything listed below is included.",
    platform: "Zoom Classes",
    classInfo: "1-hour online class — 48 days",
    program: [
      "Advanced level meditation and breathing exercises",
      "Light and easy warm-up sessions",
      "2 days quick full body dynamic workout",
      "3 days back-to-back progressive challenge",
      "3 days high-volume fat-burning and strengthening challenge",
      "8 days fat loss and cardio workouts",
      "8 days intense calorie-burning workouts",
      "8 days intermediate ABC and core",
      "8 days advanced bodyweight loss challenge",
      "8 days yoga classes",
    ],
    schedule: {
      classesWeekly: "2 days",
      timing: "03:30 PM to 04:30 PM (GMT)",
    },
  },
];

function getBeltBadgeStyle(color: "yellow" | "blue" | "purple" | "brown") {
  switch (color) {
    case "yellow":
      return "bg-amber-400/15 text-amber-300 border-amber-400/40";
    case "blue":
      return "bg-blue-500/15 text-blue-300 border-blue-500/40";
    case "purple":
      return "bg-purple-500/15 text-purple-300 border-purple-500/40";
    case "brown":
      return "bg-amber-900/40 text-amber-200 border-amber-700/50";
  }
}

export default function ProgramsPage() {
  const [mainTab, setMainTab] = useState<MainTab>("mma");
  const [mmaCategory, setMmaCategory] = useState<MmaCategory>("kids");
  const [currency, setCurrency] = useState<Currency>("INR");

  const [mmaCatalog, setMmaCatalog] = useState<any>(MMA_DATA);
  const [hiitCatalog, setHiitCatalog] = useState<any[]>(HIIT_DATA);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await getAdminProgramsCatalogAction();
        if (res && res.success && res.catalog) {
          const cat = res.catalog as any;
          if (cat.mmaData) setMmaCatalog(cat.mmaData);
          if (cat.hiitData) setHiitCatalog(cat.hiitData);
        }
      } catch (err) {
        console.error("Failed to fetch dynamic program catalog:", err);
      }
    }
    loadCatalog();
  }, []);

  const currentMmaCategoryData = mmaCatalog[mmaCategory] || MMA_DATA[mmaCategory];

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
            Explore Programs
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Choose your martial arts belt progression or targeted fitness challenge pathway. All live classes are held online via Zoom Classes with official certifications.
          </p>
        </section>

        {/* Primary Tabs & Currency Switcher Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto bg-[#14161D] p-3 rounded-2xl border border-white/15 shadow-xl">
            {/* Primary Category Selector */}
            <div className="inline-flex p-1 bg-[#0A0B0E] rounded-xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setMainTab("mma");
                  setMmaCategory("kids");
                }}
                className={`flex-1 sm:flex-initial px-6 py-3 rounded-lg text-sm sm:text-base font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  mainTab === "mma"
                    ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                Mixed Martial Arts
              </button>
              <button
                type="button"
                onClick={() => setMainTab("hiit")}
                className={`flex-1 sm:flex-initial px-6 py-3 rounded-lg text-sm sm:text-base font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  mainTab === "hiit"
                    ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <Flame className="w-5 h-5" />
                Weight Loss & HIIT Workout
              </button>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-2 text-sm font-bold text-gray-200">
              <span className="text-gray-400">Display Currency:</span>
              <div className="flex items-center bg-[#0A0B0E] p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrency("INR")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    currency === "INR"
                      ? "bg-[#0080FF] text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  🇮🇳 INR (₹)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    currency === "USD"
                      ? "bg-[#0080FF] text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  🌐 USD ($)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* MMA Secondary Category Tabs & Age Banner */}
        {mainTab === "mma" && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-2 bg-[#14161D] p-2 rounded-xl border border-white/15 shadow-md">
                {(
                  [
                    { label: "Kids", key: "kids" },
                    { label: "Adults Mix", key: "adults" },
                    { label: "Ladies Only", key: "ladies" },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setMmaCategory(cat.key)}
                    className={`px-6 py-2.5 rounded-lg text-sm sm:text-base font-extrabold transition-all cursor-pointer ${
                      mmaCategory === cat.key
                        ? "bg-[#0080FF] text-white shadow-md shadow-[#0080FF]/25"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Age Pill Badge */}
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#14161D] border border-white/20 text-sm sm:text-base font-bold text-white shadow-md">
                <Users className="w-4 h-4 text-[#0080FF]" />
                <span>{currentMmaCategoryData.age}</span>
              </div>
            </div>
          </section>
        )}

        {/* Content Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {mainTab === "mma" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {((currentMmaCategoryData && currentMmaCategoryData.courses) || []).filter((c: any) => c.isActive !== false).map((course: any) => (
                <div
                  key={course.id}
                  id={course.id}
                  className="bg-[#14161D] border border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-white/30 transition-all duration-300 shadow-xl space-y-6"
                >
                  <div className="space-y-6">
                    {/* Course Title & Belt Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/10">
                      <div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-[family-name:var(--font-outfit)] leading-tight">
                          {course.title}
                        </h2>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold border shrink-0 ${getBeltBadgeStyle(
                          course.beltColor
                        )}`}
                      >
                        <Award className="w-4 h-4" />
                        {course.belt}
                      </span>
                    </div>

                    {/* PROMINENT PRICE DISPLAY BOX */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0A0B0E] border border-white/15 shadow-inner">
                      <div>
                        <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400 block mb-1 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-[#E50914]" />
                          Course Fee:
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl sm:text-4xl font-black text-white font-[family-name:var(--font-outfit)]">
                            {currency === "INR" ? `₹${course.priceINR}` : `$${course.priceUSD}`}
                          </span>
                          <span className="text-sm sm:text-base font-semibold text-gray-400">
                            {currency === "INR" ? `($${course.priceUSD} USD)` : `(₹${course.priceINR} INR)`}
                          </span>
                        </div>
                      </div>
                      <span className="px-3.5 py-1.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs sm:text-sm font-bold">
                        All-Inclusive Price
                      </span>
                    </div>

                    {/* Included & Provisions Badges */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0A0B0E] border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm font-bold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {course.provision}
                      </span>
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-gray-200 text-xs sm:text-sm font-semibold">
                        <Check className="w-4 h-4 text-[#0080FF] shrink-0" />
                        {course.inclusions}
                      </span>
                    </div>

                    {/* Platform & Class Format Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0A0B0E]/80 border border-white/10">
                        <Video className="w-5 h-5 text-[#0080FF] shrink-0" />
                        <div>
                          <p className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">
                            Platform
                          </p>
                          <p className="font-bold text-white text-sm sm:text-base">
                            {course.platform}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0A0B0E]/80 border border-white/10">
                        <Clock className="w-5 h-5 text-[#E50914] shrink-0" />
                        <div>
                          <p className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">
                            Class Format
                          </p>
                          <p className="font-bold text-white text-sm sm:text-base">
                            {course.classInfo}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Curriculum */}
                    <div className="space-y-3 pt-2">
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                        Curriculum:
                      </h3>
                      <ol className="space-y-2.5">
                        {((course.curriculum) || []).map((item: any, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-sm sm:text-base text-gray-200 leading-relaxed font-medium"
                          >
                            <span className="w-6 h-6 rounded-full bg-[#0A0B0E] border border-white/20 text-xs font-black text-[#0080FF] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                              {idx + 1}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-4 pt-4 border-t border-white/15">
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#E50914]" />
                        Schedule:
                      </h3>

                      <div className="space-y-3 text-sm sm:text-base">
                        <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                          <span className="text-gray-300 font-medium">Classes weekly:</span>
                          <span className="font-bold text-white">
                            {course.schedule?.classesWeekly}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                          <span className="text-gray-300 font-medium">Duration:</span>
                          <span className="font-bold text-white">
                            {course.schedule?.duration}
                          </span>
                        </div>

                        <div className="pt-1">
                          <span className="text-gray-300 font-medium block mb-2">
                            Available days:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {((course.schedule && course.schedule.availableDays) || []).map((day: any) => (
                              <span
                                key={day}
                                className="px-3 py-1.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-white font-bold text-xs sm:text-sm"
                              >
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Available Timings for Kids */}
                        {course.schedule?.availableTimings && (
                          <div className="pt-2">
                            <span className="text-gray-300 font-medium block mb-2">
                              Available timings:
                            </span>
                            <div className="space-y-2">
                              {course.schedule.availableTimings.map((time: any) => (
                                <div
                                  key={time}
                                  className="px-4 py-2 rounded-xl bg-[#0A0B0E] border border-emerald-500/30 text-emerald-300 font-mono text-sm sm:text-base font-bold shadow-inner"
                                >
                                  {time}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Morning & Evening Batches for Adults & Ladies */}
                        {course.schedule?.morningBatch && (
                          <div className="pt-2 space-y-3">
                            <div>
                              <span className="text-gray-300 font-bold flex items-center gap-1.5 mb-2 text-xs sm:text-sm uppercase tracking-wide">
                                <Sun className="w-4 h-4 text-amber-400" />
                                Morning Batch:
                              </span>
                              <div className="space-y-2">
                                {course.schedule.morningBatch.map((time: any) => (
                                  <div
                                    key={time}
                                    className="px-4 py-2 rounded-xl bg-[#0A0B0E] border border-amber-500/30 text-amber-300 font-mono text-sm sm:text-base font-bold shadow-inner"
                                  >
                                    {time}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {course.schedule?.eveningBatch && (
                              <div>
                                <span className="text-gray-300 font-bold flex items-center gap-1.5 mb-2 text-xs sm:text-sm uppercase tracking-wide">
                                  <Moon className="w-4 h-4 text-indigo-400" />
                                  Evening Batch:
                                </span>
                                <div className="space-y-2">
                                  {course.schedule.eveningBatch.map((time: any) => (
                                    <div
                                      key={time}
                                      className="px-4 py-2 rounded-xl bg-[#0A0B0E] border border-indigo-500/30 text-indigo-300 font-mono text-sm sm:text-base font-bold shadow-inner"
                                    >
                                      {time}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enroll Link CTA */}
                  <div className="pt-5 border-t border-white/15">
                    <Link
                      href={`/checkout?plan=${course.planId}`}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-sm sm:text-base text-center block hover:opacity-95 transition-all shadow-lg shadow-[#E50914]/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Enroll in This Program <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Weight Loss & HIIT Workout Section */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(hiitCatalog || []).filter((c: any) => c.isActive !== false).map((challenge: any) => (
                <div
                  key={challenge.id}
                  id={challenge.id}
                  className="bg-[#14161D] border border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-white/30 transition-all duration-300 shadow-xl space-y-6"
                >
                  <div className="space-y-6">
                    {/* Challenge Title */}
                    <div className="pb-4 border-b border-white/10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/40 text-xs font-black uppercase tracking-wider mb-2">
                        <Flame className="w-3.5 h-3.5" />
                        HIIT Challenge
                      </span>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-[family-name:var(--font-outfit)] leading-tight">
                        {challenge.title}
                      </h2>
                    </div>

                    {/* PROMINENT PRICE DISPLAY BOX */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0A0B0E] border border-white/15 shadow-inner">
                      <div>
                        <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400 block mb-1 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-[#E50914]" />
                          Challenge Fee:
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl sm:text-4xl font-black text-white font-[family-name:var(--font-outfit)]">
                            {currency === "INR" ? `₹${challenge.priceINR}` : `$${challenge.priceUSD}`}
                          </span>
                          <span className="text-sm sm:text-base font-semibold text-gray-400">
                            {currency === "INR" ? `($${challenge.priceUSD} USD)` : `(₹${challenge.priceINR} INR)`}
                          </span>
                        </div>
                      </div>
                      <span className="px-3.5 py-1.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs sm:text-sm font-bold">
                        All-Inclusive
                      </span>
                    </div>

                    {/* Inclusions Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-gray-200 text-xs sm:text-sm font-semibold">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        {challenge.inclusions}
                      </span>
                    </div>

                    {/* Format Badges */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0A0B0E]/80 border border-white/10">
                        <Video className="w-5 h-5 text-[#0080FF] shrink-0" />
                        <div>
                          <p className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">
                            Platform
                          </p>
                          <p className="font-bold text-white text-sm sm:text-base">
                            {challenge.platform}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0A0B0E]/80 border border-white/10">
                        <Clock className="w-5 h-5 text-[#E50914] shrink-0" />
                        <div>
                          <p className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">
                            Class Format
                          </p>
                          <p className="font-bold text-white text-sm sm:text-base">
                            {challenge.classInfo}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Program List */}
                    <div className="space-y-3 pt-2">
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                        Program:
                      </h3>
                      <ol className="space-y-2.5">
                        {((challenge.program) || []).map((item: any, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-sm sm:text-base text-gray-200 leading-relaxed font-medium"
                          >
                            <span className="w-6 h-6 rounded-full bg-[#0A0B0E] border border-white/20 text-xs font-black text-[#E50914] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                              {idx + 1}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-4 pt-4 border-t border-white/15">
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#E50914]" />
                        Schedule:
                      </h3>

                      <div className="space-y-3 text-sm sm:text-base">
                        <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                          <span className="text-gray-300 font-medium">Classes weekly:</span>
                          <span className="font-bold text-white">
                            {challenge.schedule?.classesWeekly}
                          </span>
                        </div>

                        {challenge.schedule?.availableDays && (
                          <div className="pt-1">
                            <span className="text-gray-300 font-medium block mb-2">
                              Available days:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {((challenge.schedule && challenge.schedule.availableDays) || []).map((day: any) => (
                                <span
                                  key={day}
                                  className="px-3 py-1.5 rounded-lg bg-[#0A0B0E] border border-white/15 text-white font-bold text-xs sm:text-sm"
                                >
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2">
                          <span className="text-gray-300 font-medium block mb-2">
                            Timing:
                          </span>
                          <div className="px-4 py-2 rounded-xl bg-[#0A0B0E] border border-emerald-500/30 text-emerald-300 font-mono text-sm sm:text-base font-bold shadow-inner">
                            {challenge.schedule.timing}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enroll Link CTA */}
                  <div className="pt-5 border-t border-white/15">
                    <Link
                      href={`/checkout?plan=${challenge.planId}`}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-sm sm:text-base text-center block hover:opacity-95 transition-all shadow-lg shadow-[#E50914]/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Enroll in This Challenge <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
