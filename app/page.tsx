"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Video,
  Award,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Sparkles,
  Calendar,
  Tag,
} from "lucide-react";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { PricingCards } from "@/components/public/pricing-cards";
import { FAQAccordion } from "@/components/public/faq-accordion";
import { CoachesCarousel } from "@/components/public/coaches-carousel";
import { ScrollProgressButton } from "@/components/public/scroll-progress-button";

import { getAdminBannerContentAction } from "@/actions/admin.actions";

const DEFAULT_HERO_SLIDES = [
  {
    id: "slide_1",
    badgeText: "ONLINE FITNESS & MARTIAL ARTS ACADEMY",
    titleMain: "Train Anywhere.",
    titleHighlight: "Transform Yourself!",
    subtitle: "Join live, interactive Martial Arts Belts & Fitness Transformation classes from anywhere in the world. Real-time form correction, official belt certifications, and world-class instructors.",
    primaryCtaText: "Join Academy Now",
    primaryCtaLink: "/programs",
    secondaryCtaText: "View Programs",
    secondaryCtaLink: "/programs",
    imageUrl: "/images/hero1.jpg",
    isEnabled: true,
  },
  {
    id: "slide_2",
    badgeText: "LIVE VIRTUAL ZOOM CLASSES",
    titleMain: "Master Belt Ranks.",
    titleHighlight: "Earn Official Certification!",
    subtitle: "Interactive training with 4th Dan Black Belt Instructors. Kids, Adults, and Ladies Only dedicated batches.",
    primaryCtaText: "Explore Belt Programs",
    primaryCtaLink: "/programs",
    secondaryCtaText: "Meet Master Coaches",
    secondaryCtaLink: "/coaches",
    imageUrl: "/images/hero2.jpg",
    isEnabled: true,
  },
  {
    id: "slide_3",
    badgeText: "FEMALE FITNESS & SELF DEFENSE",
    titleMain: "Empower Your Spirit.",
    titleHighlight: "Ladies Only Batches!",
    subtitle: "Female-led high energy HIIT workouts, fat loss challenges, and real-world self-defense techniques.",
    primaryCtaText: "Join Ladies Batch",
    primaryCtaLink: "/programs#ladies",
    secondaryCtaText: "Contact Support",
    secondaryCtaLink: "/contact",
    imageUrl: "/images/ladies_fitness.png",
    isEnabled: true,
  },
];

export default function HomePage() {
  const [heroSlides, setHeroSlides] = useState<any[]>(DEFAULT_HERO_SLIDES);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    async function loadBanner() {
      try {
        const res = await getAdminBannerContentAction();
        if (res && res.success && Array.isArray(res.slides) && res.slides.length > 0) {
          setHeroSlides(res.slides);
        }
      } catch (err) {
        console.error("Hero banner fetch error:", err);
      }
    }
    loadBanner();
  }, []);

  const activeSlides = heroSlides.filter((s) => s.isEnabled);
  const activeSlideCount = activeSlides.length > 0 ? activeSlides.length : 1;

  useEffect(() => {
    if (activeSlideCount <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlideCount);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlideCount]);

  const activeSlide = activeSlides[currentSlide] || activeSlides[0] || heroSlides[0];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeSlideCount);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeSlideCount) % activeSlideCount);

  const programs = [
    {
      id: "kids",
      title: "Kids Martial Arts (8-20)",
      category: "MARTIAL ARTS",
      image: "/images/kids_martial_arts.png",
      description: "Build confidence, discipline, focus, and physical coordination in a safe online virtual class environment.",
      classes: "8 - 96 Live Classes",
      duration: "1 - 12 Months",
      priceStartsINR: "2,999",
      priceStartsUSD: "39",
    },
    {
      id: "adults",
      title: "Adults Martial Arts (21+)",
      category: "MARTIAL ARTS",
      image: "/images/adults_martial_arts.png",
      description: "Master real striking, self defense techniques, belt rank mastery, and high energy martial fitness.",
      classes: "8 - 96 Live Classes",
      duration: "1 - 12 Months",
      priceStartsINR: "2,999",
      priceStartsUSD: "39",
    },
    {
      id: "ladies",
      title: "Ladies Only Programs",
      category: "LADIES SPECIAL",
      image: "/images/ladies_fitness.png",
      description: "Empowering female-only live sessions focusing on self-defense, weight management, and toning.",
      classes: "8 - 48 Live Classes",
      duration: "1 - 6 Months",
      priceStartsINR: "2,999",
      priceStartsUSD: "39",
    },
    {
      id: "weight-loss",
      title: "Weight Loss & HIIT",
      category: "FITNESS CHALLENGE",
      image: "/images/weight_loss_hiit.png",
      description: "High-intensity calorie-burning workouts designed for fat loss, stamina, and lean muscle building.",
      classes: "8 - 96 Live Sessions",
      duration: "8 - 96 Days",
      priceStartsINR: "1,499",
      priceStartsUSD: "19",
    },
  ];

  const coaches = [
    {
      name: "Sensei Rahul Sharma",
      role: "Head Martial Arts Instructor",
      experience: "14+ Years Experience",
      rank: "4th Dan Black Belt",
      image: "/images/adults_martial_arts.png",
      bio: "Former national champion specializing in Taekwondo, Karate, and virtual form corrections.",
    },
    {
      name: "Sarah Jenkins",
      role: "Lead Fitness & HIIT Coach",
      experience: "9+ Years Experience",
      rank: "Certified Master Trainer",
      image: "/images/ladies_fitness.png",
      bio: "Transformation specialist focusing on female fitness, fat loss challenges, and conditioning.",
    },
  ];

  const testimonials = [
    {
      quote: "SELFFITS changed my 12-year-old son's routine completely. He passed his Blue Belt evaluation right from our living room!",
      name: "Priya Nair",
      role: "Parent of Kid Student",
      stars: 5,
      achievement: "Blue Belt Earned",
    },
    {
      quote: "The 24 Day Weight Loss Challenge helped me lose 6 kg while boosting my energy levels. The live trainers correct form in real time!",
      name: "David Miller",
      role: "Adult Student (USA)",
      stars: 5,
      achievement: "24-Day Transformation",
    },
    {
      quote: "The Ladies Only batch is super comfortable and high energy. I feel so much stronger and confident in self-defense.",
      name: "Ananya Roy",
      role: "Ladies Batch Student",
      stars: 5,
      achievement: "Purple Belt Student",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-14 sm:pt-16">
        {/* 1. HERO SECTION WITH FULL-SCREEN 2-IMAGE CAROUSEL */}
        <section className="relative w-full min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden py-8 sm:py-12 pb-20 sm:pb-24 px-4 sm:px-6 lg:px-8">
          {/* Full-Screen Edge-to-Edge Multi-Slide Background Carousel */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {activeSlides.map((s, idx) => (
              <div
                key={s.id || idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                  currentSlide === idx ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={s.imageUrl || "/images/hero1.jpg"}
                  alt={`Hero Background Slide ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  unoptimized
                  className="object-cover object-center w-full h-full"
                />
              </div>
            ))}

            {/* Soft Light Overlay for Bright & Clear Background Image Visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E]/80 via-[#0A0B0E]/30 to-[#0A0B0E]/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0B0E]/40 via-transparent to-[#0A0B0E]/40 pointer-events-none" />
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#E50914]/25 via-transparent to-[#0080FF]/20 rounded-full blur-[140px] pointer-events-none z-1" />

          {/* Overlaid Hero Content Container - Single Line Hero Title Width */}
          <div className="max-w-7xl mx-auto relative z-10 w-full px-4 sm:px-6 text-center">
            <div className="max-w-6xl mx-auto space-y-3.5 sm:space-y-4 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0B0E]/80 border border-[#E50914]/60 text-[#E50914] text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-md shadow-lg">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                {activeSlide.badgeText}
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] font-[family-name:var(--font-outfit)] text-white">
                <span className="block">{activeSlide.titleMain}</span>
                <span className="text-[#E50914] block mt-1 sm:mt-2">
                  {activeSlide.titleHighlight}
                </span>
              </h1>

              <p className="text-gray-100 text-base sm:text-xl font-semibold max-w-3xl mx-auto leading-relaxed">
                {activeSlide.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full max-w-2xl mx-auto">
                <Link
                  href={activeSlide.primaryCtaLink || "/programs"}
                  className="px-8 py-4 sm:px-10 sm:py-4.5 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-base sm:text-lg hover:opacity-95 transition-all shadow-2xl shadow-[#E50914]/50 hover:translate-y-[-2px] flex items-center justify-center gap-2.5 text-center whitespace-nowrap shrink-0 tracking-wide w-full sm:w-auto"
                >
                  {activeSlide.primaryCtaText}
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                </Link>
                <Link
                  href={activeSlide.secondaryCtaLink || "/programs"}
                  className="px-8 py-4 sm:px-10 sm:py-4.5 rounded-2xl bg-[#0A0B0E]/85 backdrop-blur-md border border-white/35 text-white font-bold text-base sm:text-lg hover:bg-white/20 transition-all text-center whitespace-nowrap shrink-0 tracking-wide w-full sm:w-auto shadow-xl"
                >
                  {activeSlide.secondaryCtaText}
                </Link>
              </div>
            </div>
          </div>

          {/* Carousel Slide Indicators - Absolute Fixed Bottom Position */}
          <div className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0A0B0E]/70 backdrop-blur-md border border-white/10 shadow-xl">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx
                    ? "w-8 bg-[#E50914] shadow-md shadow-[#E50914]/40"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* 2. ACADEMY IMPACT & STATS SECTION */}
        <section className="relative z-20 bg-[#10121A] border-y-[0.5px] border-white/10 py-12 sm:py-16 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gradient-to-r from-[#E50914]/15 via-[#0080FF]/15 to-[#10B981]/15 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#E50914] bg-[#E50914]/15 px-3.5 py-1.5 rounded-full border border-[#E50914]/40 inline-block shadow-lg backdrop-blur-md">
                Academy Metrics & Impact
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-[family-name:var(--font-outfit)] text-white tracking-tight">
                Proven Excellence Worldwide
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm max-w-lg mx-auto">
                Transforming lives daily through high-energy live Zoom training, real-time coaching, and official belt advancement.
              </p>
            </div>

            {/* 5 Stats Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {/* Stat 1 */}
              <div className="bg-[#14161D]/90 border border-white/15 hover:border-[#E50914]/60 rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 shadow-2xl flex flex-col justify-center items-center group backdrop-blur-md">
                <div className="w-11 h-11 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] mb-3 group-hover:scale-110 transition-transform shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-[family-name:var(--font-outfit)]">
                  2,000+
                </h3>
                <p className="text-xs font-bold text-gray-300 mt-1">Active Students</p>
              </div>

              {/* Stat 2 */}
              <div className="bg-[#14161D]/90 border border-white/15 hover:border-[#38BDF8]/60 rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 shadow-2xl flex flex-col justify-center items-center group backdrop-blur-md">
                <div className="w-11 h-11 rounded-xl bg-[#0080FF]/15 border border-[#0080FF]/30 flex items-center justify-center text-[#38BDF8] mb-3 group-hover:scale-110 transition-transform shadow-md">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#38BDF8] font-[family-name:var(--font-outfit)]">
                  98%
                </h3>
                <p className="text-xs font-bold text-gray-300 mt-1">Belt Pass Rate</p>
              </div>

              {/* Stat 3 */}
              <div className="bg-[#14161D]/90 border border-white/15 hover:border-[#34D399]/60 rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 shadow-2xl flex flex-col justify-center items-center group backdrop-blur-md">
                <div className="w-11 h-11 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#34D399] mb-3 group-hover:scale-110 transition-transform shadow-md">
                  <Star className="w-5 h-5 fill-[#34D399]" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#34D399] font-[family-name:var(--font-outfit)]">
                  4.9 / 5
                </h3>
                <p className="text-xs font-bold text-gray-300 mt-1">Satisfaction</p>
              </div>

              {/* Stat 4 */}
              <div className="bg-[#14161D]/90 border border-white/15 hover:border-[#FBBF24]/60 rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 shadow-2xl flex flex-col justify-center items-center group backdrop-blur-md">
                <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#FBBF24] mb-3 group-hover:scale-110 transition-transform shadow-md">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#FBBF24] font-[family-name:var(--font-outfit)]">
                  50+
                </h3>
                <p className="text-xs font-bold text-gray-300 mt-1">Live Classes Every Wk</p>
              </div>

              {/* Stat 5 */}
              <div className="bg-[#14161D]/90 border border-white/15 hover:border-[#C084FC]/60 rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 shadow-2xl flex flex-col justify-center items-center group col-span-2 sm:col-span-1 backdrop-blur-md">
                <div className="w-11 h-11 rounded-xl bg-[#A855F7]/15 border border-[#A855F7]/30 flex items-center justify-center text-[#C084FC] mb-3 group-hover:scale-110 transition-transform shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#C084FC] font-[family-name:var(--font-outfit)]">
                  20+
                </h3>
                <p className="text-xs font-bold text-gray-300 mt-1">Expert Coaches</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. ABOUT PREVIEW SECTION */}
        <section className="py-16 sm:py-20 bg-[#0E1015] border-y-[0.5px] border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <Image
                src="/images/kids_martial_arts.png"
                alt="Kids Martial Arts Academy"
                width={600}
                height={400}
                className="w-full h-[260px] sm:h-[380px] object-cover"
              />
            </div>

            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0080FF]">
                About SELFFITS Academy
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
                Structured Virtual Martial Arts & Fitness Academy
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                SELFFITS was founded to bring authentic martial arts discipline and high-energy fitness training directly into homes around the globe. We eliminate recorded video fatigue by conducting 100% interactive live sessions.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#E50914] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Real-Time Form Correction</h4>
                    <p className="text-xs text-gray-400">Coaches observe and guide every stance live.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#0080FF] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Official Belt Certificates</h4>
                    <p className="text-xs text-gray-400">Earn recognized certifications upon completion.</p>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#E50914] hover:underline"
                >
                  Read Our Full Story <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FEATURED PROGRAMS SECTION */}
        <section className="py-16 sm:py-24 px-4 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
              Training Pathways
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
              Explore Our Programs
            </h2>
            <p className="text-gray-400 text-sm">
              Tailored martial arts belt progressions and fitness transformation challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((prog) => (
              <div
                key={prog.id}
                className="bg-[#14161D] border border-white/15 rounded-2xl overflow-hidden group hover:border-[#E50914]/60 transition-all duration-300 flex flex-col justify-between shadow-xl hover:-translate-y-1"
              >
                <div>
                  <div className="relative h-48 sm:h-52 overflow-hidden">
                    <Image
                      src={prog.image}
                      alt={prog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0A0B0E]/85 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-[#0080FF] border border-white/10">
                      {prog.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <h3 className="text-lg sm:text-xl font-bold text-white font-[family-name:var(--font-outfit)] leading-snug">
                      {prog.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 leading-relaxed font-medium">
                      {prog.description}
                    </p>

                    {/* Classes & Duration Format Badges */}
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

                    {/* PROMINENT ATTRACTIVE PRICE BOX */}
                    <div className="p-3.5 rounded-xl bg-[#0A0B0E] border border-white/15 shadow-inner space-y-1">
                      <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-gray-400 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#E50914]" />
                        Starts From
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
                          ₹{prog.priceStartsINR}
                        </span>
                        <span className="text-xs font-bold text-gray-400">
                          (${prog.priceStartsUSD} USD)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/programs#${prog.id}`}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white text-xs sm:text-sm font-extrabold text-center block transition-all shadow-md shadow-[#E50914]/20 hover:opacity-95 flex items-center justify-center gap-2"
                  >
                    View Program Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* 5. WHY CHOOSE SELFFITS */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
              Academy Value
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
              Why Choose SELFFITS?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#14161D] border border-white/10 p-5 sm:p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E50914]/15 flex items-center justify-center text-[#E50914]">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">100% Live Coaching</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                No boring pre-recorded videos. Every class is live over Zoom Classes.
              </p>
            </div>

            <div className="bg-[#14161D] border border-white/10 p-5 sm:p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#0080FF]/15 flex items-center justify-center text-[#0080FF]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Form Correction</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Trainers watch your stance and correct techniques live during session.
              </p>
            </div>

            <div className="bg-[#14161D] border border-white/10 p-5 sm:p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 flex items-center justify-center text-[#10B981]">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Official Belt Certificates</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Earn digital belt certificates uploaded directly to your dashboard.
              </p>
            </div>

            <div className="bg-[#14161D] border border-white/10 p-5 sm:p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/15 flex items-center justify-center text-[#F59E0B]">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Flexible Global Batches</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Morning and evening batches available across international timezones.
              </p>
            </div>
          </div>
        </section>

        {/* 6. HOW IT WORKS (3 Simple Steps) */}
        <section className="py-16 sm:py-24 bg-[#0E1015] border-y-[0.5px] border-white/10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0080FF]">
                3 Simple Steps
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
                How SELFFITS Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-2xl relative">
                <span className="text-4xl sm:text-5xl font-black text-[#E50914]/20 absolute top-4 right-6 font-[family-name:var(--font-outfit)]">
                  01
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">Select Your Program</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Choose your belt tier (Yellow to Brown) or fitness challenge (8 to 96 Days) and complete enrollment.
                </p>
              </div>

              <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-2xl relative">
                <span className="text-4xl sm:text-5xl font-black text-[#0080FF]/20 absolute top-4 right-6 font-[family-name:var(--font-outfit)]">
                  02
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">Join Live Classes</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Log into your student dashboard, view today&apos;s active Zoom Classes link, and train with live feedback.
                </p>
              </div>

              <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-2xl relative">
                <span className="text-4xl sm:text-5xl font-black text-[#10B981]/20 absolute top-4 right-6 font-[family-name:var(--font-outfit)]">
                  03
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">Get Certified</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Pass your virtual belt evaluation and download your official completion certificate directly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. MEET OUR COACHES CAROUSEL */}
        <section className="py-16 sm:py-24 bg-[#0E1015] border-y-[0.5px] border-white/10 px-4">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0080FF]">
                World Class Instructors
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
                Meet Our Master Coaches
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">
                Swipe or click to meet our black belt senseis and master fitness trainers.
              </p>
            </div>

            <CoachesCarousel />
          </div>
        </section>

        {/* 8. STUDENT CTA BANNER: READY TO KICKSTART YOUR JOURNEY */}
        <section className="py-16 sm:py-20 px-4">
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-[#E50914] via-[#DC2626] to-[#0080FF] p-6 sm:p-12 lg:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-[family-name:var(--font-outfit)]">
              Ready to Kickstart Your Journey?
            </h2>
            <p className="text-white/90 text-xs sm:text-sm md:text-base max-w-2xl mx-auto">
              Join thousands of students training live around the world. Enroll in a belt tier or fitness challenge today.
            </p>
            <div className="pt-4">
              <Link
                href="/programs"
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-white text-[#0A0B0E] font-black text-sm sm:text-base hover:bg-gray-100 transition-all shadow-xl inline-flex items-center gap-2"
              >
                Enroll in Academy <Sparkles className="w-5 h-5 text-[#E50914]" />
              </Link>
            </div>
          </div>
        </section>

        {/* 9. FAQ PREVIEW */}
        <section className="py-16 sm:py-24 max-w-5xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
              Frequently Asked Questions
            </h2>
          </div>

          <FAQAccordion />
        </section>

        {/* 10. BECOME A SELFFITS COACH CTA */}
        <section className="py-16 sm:py-20 px-4">
          <div className="max-w-5xl mx-auto rounded-3xl bg-[#14161D] border border-white/15 p-8 sm:p-12 lg:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden group hover:border-[#E50914]/40 transition-all">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-[#E50914]/15 to-[#0080FF]/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E50914]/10 text-[#E50914] text-xs font-bold border border-[#E50914]/30 uppercase tracking-widest">
                <Award className="w-3.5 h-3.5" />
                Instructor Recruitment
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight uppercase">
                BECOME A SELFFITS COACH
              </h2>
            </div>

            <p className="relative z-10 text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
              Are you a qualified fitness or martial arts instructor? Join SELFFITS and share your expertise with students from around the world.
            </p>

            <div className="relative z-10 pt-2">
              <Link
                href="/become-coach"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-black text-sm sm:text-base uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/30 inline-flex items-center gap-2"
              >
                BECOME A COACH <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 11. SUCCESS STORIES & TESTIMONIALS (JUST ABOVE FOOTER) */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
              Student Transformations
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
              Success Stories & Testimonials
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <div key={idx} className="bg-[#14161D] border border-white/10 p-5 sm:p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-1 text-[#F59E0B]">
                  {[...Array(item.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-gray-300 italic leading-relaxed">
                  &quot;{item.quote}&quot;
                </p>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">{item.name}</h4>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">{item.role}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#E50914]/15 text-[#E50914] text-[10px] font-bold shrink-0">
                    {item.achievement}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <ScrollProgressButton />
    </div>
  );
}
