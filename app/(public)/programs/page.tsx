"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { Video, Calendar, Check, ArrowRight } from "lucide-react";

export default function ProgramsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const programsData = [
    {
      id: "kids-martial-arts",
      title: "Kids Martial Arts (Ages 8-20)",
      category: "KIDS",
      image: "/images/kids_martial_arts.png",
      description: "Comprehensive virtual martial arts curriculum teaching stances, kicks, strikes, and discipline. Designed specifically to boost focus, agility, and confidence in young students.",
      duration: "1 to 12 Months",
      classes: "8 - 96 Live Classes",
      benefits: [
        "Increases focus, discipline & school concentration",
        "Real-time posture & technique correction",
        "Official Belt Certifications (Yellow to Brown)",
        "Fun, high-energy interactive virtual group",
      ],
    },
    {
      id: "adults-martial-arts",
      title: "Adults Martial Arts (Ages 21+)",
      category: "ADULTS",
      image: "/images/adults_martial_arts.png",
      description: "Authentic martial arts training combining striking, defensive maneuvers, Kata forms, and sparring drills. Build functional strength while advancing through official belt ranks.",
      duration: "1 to 12 Months",
      classes: "8 - 96 Live Classes",
      benefits: [
        "Master real self-defense & striking combos",
        "High-calorie burn martial fitness conditioning",
        "Belt rank graduation evaluations",
        "Flexible morning & evening international batches",
      ],
    },
    {
      id: "ladies-only",
      title: "Ladies Only Programs",
      category: "LADIES",
      image: "/images/ladies_fitness.png",
      description: "Exclusive female-only virtual sessions tailored for self-defense empowerment, core strengthening, fat burn, and physical toning led by supportive master trainers.",
      duration: "1 to 6 Months",
      classes: "8 - 48 Live Classes",
      benefits: [
        "100% comfortable female-only live environment",
        "Practical self-defense tactics for everyday safety",
        "Full-body toning & flexibility workouts",
        "Direct coach guidance & form correction",
      ],
    },
    {
      id: "weight-loss-challenge",
      title: "Weight Loss Challenge",
      category: "WEIGHT_LOSS",
      image: "/images/weight_loss_hiit.png",
      description: "Goal-oriented fitness challenge focusing on high-calorie burn, metabolic acceleration, and dietary guidance to shed fat and build lean muscle rapidly.",
      duration: "8 to 96 Days",
      classes: "8 - 96 Live Sessions",
      benefits: [
        "Metabolic conditioning for rapid fat loss",
        "Daily live workouts with trainer motivation",
        "Calorie guidelines & weekly progress check-ins",
        "Transformation completion certificate",
      ],
    },
    {
      id: "hiit-programs",
      title: "HIIT Fitness Programs",
      category: "HIIT",
      image: "/images/weight_loss_hiit.png",
      description: "Fast-paced high-intensity interval training designed to push your cardiovascular limit, boost endurance, and sculpt your physique with minimal home equipment.",
      duration: "24 to 48 Days",
      classes: "24 - 48 Live Sessions",
      benefits: [
        "30-45 minute explosive workout routines",
        "Increases VO2 max stamina & agility",
        "No heavy equipment required",
        "Live trainer energy & form supervision",
      ],
    },
  ];

  const filteredPrograms =
    activeCategory === "ALL"
      ? programsData
      : programsData.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        {/* Header */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
            Academy Catalog
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-[family-name:var(--font-outfit)]">
            Explore All Programs
          </h1>
          <p className="text-gray-400 text-base max-w-2xl mx-auto">
            Choose your martial arts belt progression or fitness challenge pathway. All classes are conducted live on Google Meet & Zoom.
          </p>
        </section>

        {/* Filter Tabs */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex flex-wrap items-center justify-center gap-2 bg-[#14161D] p-2 rounded-2xl border border-white/10 max-w-3xl mx-auto">
            {[
              { label: "All Programs", val: "ALL" },
              { label: "Kids Martial Arts", val: "KIDS" },
              { label: "Adults Martial Arts", val: "ADULTS" },
              { label: "Ladies Only", val: "LADIES" },
              { label: "Weight Loss", val: "WEIGHT_LOSS" },
              { label: "HIIT", val: "HIIT" },
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => setActiveCategory(tab.val)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === tab.val
                    ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Program Cards Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                id={program.id}
                className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row group hover:border-[#E50914]/50 transition-all duration-300"
              >
                <div className="relative md:w-2/5 h-64 md:h-auto overflow-hidden shrink-0">
                  <Image
                    src={program.image}
                    alt={program.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0A0B0E]/80 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-[#0080FF]">
                    {program.category}
                  </span>
                </div>

                <div className="p-6 md:w-3/5 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white font-[family-name:var(--font-outfit)] mb-2">
                      {program.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      {program.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-300 pb-3 border-b border-white/10 mb-4">
                      <span className="flex items-center gap-1.5 text-[#E50914]">
                        <Video className="w-4 h-4" />
                        {program.classes}
                      </span>
                      <span className="flex items-center gap-1.5 text-[#0080FF]">
                        <Calendar className="w-4 h-4" />
                        {program.duration}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-2">
                      Key Program Benefits:
                    </h4>
                    <ul className="space-y-1.5 mb-6">
                      {program.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                          <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={`/membership?program=${program.id}`}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-bold text-xs text-center block hover:opacity-95 transition-opacity shadow-md shadow-[#E50914]/20 flex items-center justify-center gap-2"
                  >
                    Enroll in This Program <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
