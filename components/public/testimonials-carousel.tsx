"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export interface TestimonialCardItem {
  id?: string;
  quote: string;
  name: string;
  role: string;
  stars?: number;
  achievement?: string;
}

const defaultTestimonialsList: TestimonialCardItem[] = [
  {
    id: "test_1",
    quote: "SELFFITS changed my 12-year-old son's routine completely. He passed his curriculum evaluation right from our living room!",
    name: "Priya Nair",
    role: "Parent of Kid Student",
    stars: 5,
    achievement: "Level 3 Mastery Earned",
  },
  {
    id: "test_2",
    quote: "The 5 Days / Week Weight Loss program helped me lose 6 kg while boosting my energy levels. The live trainers correct form in real time!",
    name: "David Miller",
    role: "Adult Student (USA)",
    stars: 5,
    achievement: "5-Day Transformation",
  },
  {
    id: "test_3",
    quote: "The Ladies Only batch is super comfortable and high energy. I feel so much stronger and confident in self-defense.",
    name: "Ananya Roy",
    role: "Ladies Batch Student",
    stars: 5,
    achievement: "Advanced Scholar",
  },
  {
    id: "test_4",
    quote: "Attending live Zoom classes with real-time feedback made all the difference. Passed my yellow belt exam on the first attempt!",
    name: "Marcus Vance",
    role: "Martial Arts Student",
    stars: 5,
    achievement: "Yellow Belt Certified",
  },
];

export function TestimonialsCarousel({ items }: { items?: TestimonialCardItem[] }) {
  const testimonials = items && items.length > 0 ? items : defaultTestimonialsList;

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

  const maxIndex = Math.max(0, testimonials.length - visibleCount);

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
      {/* Centered Left & Right Navigation Arrows (Matching Master Coaches & Programs Carousel) */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePrev}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#14161D] border border-white/20 text-white hover:bg-[#E50914] hover:border-[#E50914] transition-all duration-300 shadow-xl flex items-center justify-center active:scale-90 cursor-pointer group"
          aria-label="Previous Testimonial"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={handleNext}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#14161D] border border-white/20 text-white hover:bg-[#E50914] hover:border-[#E50914] transition-all duration-300 shadow-xl flex items-center justify-center active:scale-90 cursor-pointer group"
          aria-label="Next Testimonial"
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
          {testimonials.map((t, idx) => (
            <div
              key={t.id || idx}
              className="w-full sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] shrink-0 bg-[#14161D] border border-white/15 hover:border-[#E50914]/60 transition-all duration-300 p-6 sm:p-7 rounded-2xl space-y-4 flex flex-col justify-between shadow-xl hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#F59E0B]">
                  {Array.from({ length: t.stars || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-300 italic leading-relaxed">
                  &quot;{t.quote}&quot;
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <p className="text-[11px] text-gray-400">{t.role}</p>
                </div>
                {t.achievement && (
                  <span className="px-2.5 py-1 rounded bg-[#0080FF]/15 text-[#0080FF] text-[10px] font-extrabold border border-[#0080FF]/30">
                    {t.achievement}
                  </span>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pagination Dot Indicators */}
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
                aria-label={`Go to testimonial slide ${idx + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
