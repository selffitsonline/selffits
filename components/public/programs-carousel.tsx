"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Video, Calendar, Tag, ArrowRight } from "lucide-react";

export interface ProgramCardItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  classes: string;
  duration: string;
  priceStartsUSD: string;
  href: string;
}

const defaultProgramsList: ProgramCardItem[] = [
  {
    id: "kids",
    title: "Kids Martial Arts (8-20)",
    category: "MARTIAL ARTS",
    image: "/images/kids_martial_arts.png",
    description: "Build confidence, discipline, focus, and physical coordination in a safe online virtual class environment.",
    classes: "4 - 20 Live Classes",
    duration: "1 - 5 Days / Wk",
    priceStartsUSD: "25",
    href: "/programs?cat=mma&audience=kids",
  },
  {
    id: "adults",
    title: "Adults Martial Arts (21+)",
    category: "MARTIAL ARTS",
    image: "/images/adults_martial_arts.png",
    description: "Master striking techniques, self defense maneuvers, physical conditioning, and martial arts syllabus mastery.",
    classes: "4 - 20 Live Classes",
    duration: "1 - 5 Days / Wk",
    priceStartsUSD: "25",
    href: "/programs?cat=mma&audience=adults",
  },
  {
    id: "ladies",
    title: "Ladies Only Programs",
    category: "LADIES SPECIAL",
    image: "/images/ladies_fitness.png",
    description: "Empowering female-only live sessions focusing on self-defense, weight management, toning, and personal safety.",
    classes: "4 - 20 Live Classes",
    duration: "1 - 5 Days / Wk",
    priceStartsUSD: "25",
    href: "/programs?cat=mma&audience=ladies",
  },
  {
    id: "weight-loss",
    title: "Fitness & Weight Management",
    category: "FITNESS & WEIGHT",
    image: "/images/weight_loss_hiit.png",
    description: "High-intensity calorie-burning workouts designed for fat loss, stamina, and lean muscle building.",
    classes: "4 - 20 Live Sessions",
    duration: "1 - 5 Days / Wk",
    priceStartsUSD: "25",
    href: "/programs?cat=hiit&audience=adults",
  },
];

export function ProgramsCarousel({ items }: { items?: ProgramCardItem[] }) {
  const programs = items && items.length > 0 ? items : defaultProgramsList;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  // Dynamically compute visible items based on viewport width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, programs.length - visibleCount);

  useEffect(() => {
    if (isPaused || maxIndex === 0) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, isPaused, maxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <div
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Centered Left & Right Navigation Arrows (Side by Side in Middle - Matching Master Coaches Carousel) */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePrev}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#14161D] border border-white/20 text-white hover:bg-[#E50914] hover:border-[#E50914] transition-all duration-300 shadow-xl flex items-center justify-center active:scale-90 cursor-pointer group"
          aria-label="Previous Program"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={handleNext}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#14161D] border border-white/20 text-white hover:bg-[#E50914] hover:border-[#E50914] transition-all duration-300 shadow-xl flex items-center justify-center active:scale-90 cursor-pointer group"
          aria-label="Next Program"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* CONTINUOUS SMOOTH HORIZONTAL SLIDING TRACK */}
      <div className="overflow-hidden w-full py-2">
        <motion.div
          className="flex gap-6"
          animate={{ x: `calc(-${currentIndex} * (100% + 24px) / ${visibleCount})` }}
          transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
        >
          {programs.map((prog, idx) => (
            <div
              key={prog.id || idx}
              className="w-full sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] shrink-0 bg-[#14161D] border border-white/15 rounded-2xl overflow-hidden group hover:border-[#E50914]/60 transition-all duration-300 flex flex-col justify-between shadow-xl hover:-translate-y-1"
            >
              <div>
                {/* Image Container */}
                <div className="relative h-48 sm:h-52 overflow-hidden">
                  <Image
                    src={prog.image || "/images/kids_martial_arts.png"}
                    alt={prog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0A0B0E]/85 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-[#0080FF] border border-white/10">
                    {prog.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white font-[family-name:var(--font-outfit)] leading-snug">
                    {prog.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 leading-relaxed font-medium">
                    {prog.description}
                  </p>

                  {/* Classes & Duration Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0A0B0E]/60 border border-white/5 text-gray-200">
                      <Video className="w-4 h-4 text-[#E50914] shrink-0" />
                      <span className="font-semibold text-[11px] sm:text-xs truncate">{prog.classes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0A0B0E]/60 border border-white/5 text-gray-200">
                      <Calendar className="w-4 h-4 text-[#0080FF] shrink-0" />
                      <span className="font-semibold text-[11px] sm:text-xs truncate">{prog.duration}</span>
                    </div>
                  </div>

                  {/* Price Box */}
                  <div className="p-3.5 rounded-xl bg-[#0A0B0E] border border-white/15 shadow-inner space-y-1">
                    <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#E50914]" />
                      Starts From
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
                        ${prog.priceStartsUSD || "25"}
                      </span>
                      <span className="text-xs font-bold text-gray-400">/ Month</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail CTA Link */}
              <div className="p-5 pt-0">
                <Link
                  href={prog.href || "/programs"}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white text-xs sm:text-sm font-extrabold text-center block transition-all shadow-md shadow-[#E50914]/20 hover:opacity-95 flex items-center justify-center gap-2"
                >
                  View Program Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pagination Dot Indicators (Matching Master Coaches Carousel) */}
      {maxIndex > 0 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive ? "w-8 bg-[#E50914]" : "w-2.5 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Go to program slide ${idx + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
