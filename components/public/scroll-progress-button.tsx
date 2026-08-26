"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollProgressButton() {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100)));
        setScrollPercentage(progress);
        setIsVisible(scrollTop > 120);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  // SVG Circle stroke parameters
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollPercentage / 100) * circumference;

  const isAtBottom = scrollPercentage >= 98;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <button
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        title={isAtBottom ? "Back to Top" : `${scrollPercentage}% scrolled`}
        className="relative w-14 h-14 rounded-full bg-[#14161D]/90 border border-white/20 shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-[#E50914]/60 active:scale-95 group cursor-pointer"
      >
        {/* SVG Animated Circular Progress Ring */}
        <svg className="w-full h-full transform -rotate-90 p-1" viewBox="0 0 52 52">
          {/* Background Track Circle */}
          <circle
            cx="26"
            cy="26"
            r={radius}
            className="stroke-white/10"
            strokeWidth="3.5"
            fill="transparent"
          />

          {/* Animated Progress Circle with Brand Gradient */}
          <circle
            cx="26"
            cy="26"
            r={radius}
            stroke="url(#scrollGradient)"
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-150 ease-out"
          />

          {/* SVG Gradient Definition */}
          <defs>
            <linearGradient id="scrollGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E50914" />
              <stop offset="50%" stopColor="#FF1E27" />
              <stop offset="100%" stopColor="#0080FF" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content: Percentage Text or Arrow Up at 100% */}
        <div className="absolute inset-0 flex items-center justify-center text-white font-extrabold select-none">
          {isAtBottom ? (
            <ArrowUp className="w-5 h-5 text-[#E50914] group-hover:scale-125 transition-transform animate-bounce" />
          ) : (
            <span className="text-[11px] font-black font-[family-name:var(--font-outfit)] tracking-tighter text-white group-hover:text-[#E50914] transition-colors">
              {scrollPercentage}%
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
