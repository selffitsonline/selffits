"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ShieldCheck, Star } from "lucide-react";

export interface Coach {
  id: string;
  name: string;
  role: string;
  experience: string;
  rank: string;
  image: string;
  bio: string;
  specialty: string;
}

export function CoachesCarousel() {
  const coaches: Coach[] = [
    {
      id: "rahul",
      name: "Sensei Rahul Sharma",
      role: "Head Martial Arts Instructor",
      experience: "14+ Years Teaching",
      rank: "4th Dan Black Belt",
      image: "/images/adults_martial_arts.png",
      bio: "Former national champion specializing in Taekwondo, Karate, and real-time stance evaluation.",
      specialty: "Martial Arts & Belt Progression",
    },
    {
      id: "sarah",
      name: "Sarah Jenkins",
      role: "Lead Fitness & HIIT Coach",
      experience: "9+ Years Master Coaching",
      rank: "Certified Master Trainer",
      image: "/images/ladies_fitness.png",
      bio: "Transformation specialist focusing on female fitness, fat loss challenges, and conditioning.",
      specialty: "HIIT & Weight Loss",
    },
    {
      id: "kenji",
      name: "Master Kenji Sato",
      role: "Kickboxing & Self Defense Lead",
      experience: "12+ Years Experience",
      rank: "3rd Dan Black Belt",
      image: "/images/hero1.jpg",
      bio: "Expert in strike mechanics, rapid reaction drills, and practical self-defense for all age groups.",
      specialty: "Combat Self Defense",
    },
    {
      id: "priya",
      name: "Priya Kapoor",
      role: "Ladies Only Fitness Coach",
      experience: "8+ Years Coaching",
      rank: "Aerobics & HIIT Specialist",
      image: "/images/ladies_fitness.png",
      bio: "Dedicated instructor empowering women worldwide through energetic online workout routines.",
      specialty: "Ladies Special Batches",
    },
    {
      id: "alex",
      name: "Master Alex Vance",
      role: "Kids Martial Arts Mentor",
      experience: "10+ Years Experience",
      rank: "2nd Dan Black Belt",
      image: "/images/kids_martial_arts.png",
      bio: "Specialist in youth discipline, agility building, and virtual belt examination preparation.",
      specialty: "Youth Belt Academy",
    },
    {
      id: "elena",
      name: "Elena Rostova",
      role: "Core Conditioning Specialist",
      experience: "11+ Years Experience",
      rank: "Master Mobility Trainer",
      image: "/images/weight_loss_hiit.png",
      bio: "Passionate trainer focusing on core strength, muscle stamina building, and posture alignment.",
      specialty: "Core Strength & Fat Shred",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const visibleCount = 3;
  const maxIndex = coaches.length - visibleCount; // 6 - 3 = 3

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [currentIndex, isPaused]);

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
      {/* Centered Left & Right Navigation Arrows (Side by Side in Middle) */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePrev}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#14161D] border border-white/20 text-white hover:bg-[#E50914] hover:border-[#E50914] transition-all duration-300 shadow-xl flex items-center justify-center active:scale-90 cursor-pointer group"
          aria-label="Previous Coach"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={handleNext}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#14161D] border border-white/20 text-white hover:bg-[#E50914] hover:border-[#E50914] transition-all duration-300 shadow-xl flex items-center justify-center active:scale-90 cursor-pointer group"
          aria-label="Next Coach"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* CONTINUOUS SMOOTH HORIZONTAL SLIDING TRACK (NO FADE-IN / FADE-OUT) */}
      <div className="overflow-hidden w-full py-2">
        <motion.div
          className="flex gap-6"
          animate={{ x: `calc(-${currentIndex} * (100% + 24px) / 3)` }}
          transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
        >
          {coaches.map((coach) => (
            <div
              key={coach.id}
              className="w-full sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] shrink-0 bg-[#14161D] border border-white/15 rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-[#E50914]/60 transition-colors duration-300 shadow-xl"
            >
              <div>
                {/* Image Container */}
                <div className="relative h-60 w-full overflow-hidden">
                  <Image
                    src={coach.image}
                    alt={coach.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0A0B0E]/85 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-[#0080FF] border border-white/15">
                    {coach.specialty}
                  </span>
                </div>

                {/* Coach Info Content */}
                <div className="p-6 space-y-3 text-left">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#E50914] bg-[#E50914]/15 px-2.5 py-0.5 rounded border border-[#E50914]/30 inline-block mb-1">
                      {coach.rank}
                    </span>
                    <h3 className="text-xl font-extrabold text-white font-[family-name:var(--font-outfit)] leading-snug">
                      {coach.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#0080FF] mt-0.5">{coach.role}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{coach.experience}</p>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                    {coach.bio}
                  </p>
                </div>
              </div>

              {/* Card Footer Badge */}
              <div className="border-t-[0.5px] border-white/10 px-6 py-4 flex items-center justify-between text-xs text-gray-400 mt-auto bg-black/20">
                <span className="flex items-center gap-1.5 text-[#10B981] font-semibold text-[11px]">
                  <ShieldCheck className="w-4 h-4" /> Live Form Evaluation Active
                </span>
                <div className="flex items-center gap-1 text-[#F59E0B]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold text-xs text-white">4.9</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pagination Dot Indicators */}
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
              aria-label={`Go to coach ${idx + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
