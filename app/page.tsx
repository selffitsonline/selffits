"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { PricingCards } from "@/components/public/pricing-cards";
import { FAQAccordion } from "@/components/public/faq-accordion";

export default function HomePage() {
  const programs = [
    {
      id: "kids",
      title: "Kids Martial Arts (8-20)",
      category: "MARTIAL ARTS",
      image: "/images/kids_martial_arts.png",
      description: "Build confidence, discipline, focus, and physical coordination in a safe online virtual class environment.",
      classes: "8 - 96 Live Classes",
      duration: "1 - 12 Months",
    },
    {
      id: "adults",
      title: "Adults Martial Arts (21+)",
      category: "MARTIAL ARTS",
      image: "/images/adults_martial_arts.png",
      description: "Master real striking, self defense techniques, belt rank mastery, and high energy martial fitness.",
      classes: "8 - 96 Live Classes",
      duration: "1 - 12 Months",
    },
    {
      id: "ladies",
      title: "Ladies Only Programs",
      category: "LADIES SPECIAL",
      image: "/images/ladies_fitness.png",
      description: "Empowering female-only live sessions focusing on self-defense, weight management, and toning.",
      classes: "8 - 48 Live Classes",
      duration: "1 - 6 Months",
    },
    {
      id: "weight-loss",
      title: "Weight Loss & HIIT",
      category: "FITNESS CHALLENGE",
      image: "/images/weight_loss_hiit.png",
      description: "High-intensity calorie-burning workouts designed for fat loss, stamina, and lean muscle building.",
      classes: "8 - 96 Live Sessions",
      duration: "8 - 96 Days",
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

      <main className="flex-grow pt-20">
        {/* 1. HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-4">
          {/* Background Ambient Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#E50914]/20 via-transparent to-[#0080FF]/20 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                Live Virtual Academy • Google Meet & Zoom
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight font-[family-name:var(--font-outfit)]">
                Train Anywhere. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] via-white to-[#0080FF]">
                  Transform Yourself.
                </span>
              </h1>

              <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Join live, interactive Martial Arts Belts & Fitness Transformation classes from anywhere in the world. Real-time form correction, official belt certifications, and world-class instructors.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 pt-2 w-full max-w-md mx-auto lg:mx-0">
                <Link
                  href="/membership"
                  className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-bold text-base hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/25 hover:translate-y-[-2px] flex items-center justify-center gap-2 text-center"
                >
                  Join Academy Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/programs"
                  className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#14161D] border border-white/15 text-white font-semibold text-base hover:bg-white/5 transition-all text-center"
                >
                  View Programs
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center lg:text-left">
                <div>
                  <h4 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
                    2,000+
                  </h4>
                  <p className="text-xs text-gray-400">Active Global Students</p>
                </div>
                <div>
                  <h4 className="text-2xl sm:text-3xl font-extrabold text-[#0080FF] font-[family-name:var(--font-outfit)]">
                    98%
                  </h4>
                  <p className="text-xs text-gray-400">Belt Certification Rate</p>
                </div>
                <div>
                  <h4 className="text-2xl sm:text-3xl font-extrabold text-[#10B981] font-[family-name:var(--font-outfit)]">
                    4.9 / 5
                  </h4>
                  <p className="text-xs text-gray-400">Student Satisfaction</p>
                </div>
              </div>
            </motion.div>

            {/* Right Media Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex justify-center w-full"
            >
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#14161D] group max-w-lg w-full">
                <Image
                  src="/images/adults_martial_arts.png"
                  alt="Live Martial Arts Training"
                  width={600}
                  height={600}
                  priority
                  className="w-full h-[280px] sm:h-[380px] md:h-[450px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E] via-transparent to-transparent" />

                {/* Floating Live Badge Overlay */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-3 sm:p-4 rounded-xl glass-panel flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E50914]/20 border border-[#E50914] flex items-center justify-center text-[#E50914] shrink-0">
                      <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">Live Class Broadcasting</h4>
                      <p className="text-[10px] sm:text-xs text-gray-400 truncate">Google Meet & Zoom Active</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] text-[10px] sm:text-xs font-bold border border-[#10B981]/30 shrink-0">
                    LIVE NOW
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. ABOUT PREVIEW SECTION */}
        <section className="py-16 sm:py-20 bg-[#0E1015] border-y border-white/10">
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
                className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden group hover:border-[#E50914]/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 sm:h-48 overflow-hidden">
                    <Image
                      src={prog.image}
                      alt={prog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0A0B0E]/80 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-[#0080FF]">
                      {prog.category}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 space-y-3">
                    <h3 className="text-base sm:text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                      {prog.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                      {prog.description}
                    </p>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-300">
                      <span className="flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-[#E50914]" />
                        {prog.classes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#0080FF]" />
                        {prog.duration}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 pt-0">
                  <Link
                    href={`/programs#${prog.id}`}
                    className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-[#E50914] hover:border-[#E50914] text-white text-xs font-bold text-center block transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. MEMBERSHIP & PRICING SECTION */}
        <section className="py-16 sm:py-24 bg-[#0E1015] border-y border-white/10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0080FF]">
                Transparent Pricing
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
                Membership Plans & Belt Tiers
              </h2>
              <p className="text-gray-400 text-sm">
                Choose your martial arts belt progression or fitness challenge plan.
              </p>
            </div>

            <PricingCards />
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
                No boring pre-recorded videos. Every class is live over Google Meet or Zoom.
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
        <section className="py-16 sm:py-24 bg-[#0E1015] border-y border-white/10 px-4">
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
                  Log into your student dashboard, view today&apos;s active Meet/Zoom link, and train with live feedback.
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

        {/* 7. SUCCESS STORIES PREVIEW */}
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

        {/* 8. MEET OUR COACHES */}
        <section className="py-16 sm:py-24 bg-[#0E1015] border-y border-white/10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0080FF]">
                World Class Instructors
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-outfit)]">
                Meet Our Master Coaches
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {coaches.map((c, i) => (
                <div key={i} className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden flex flex-col sm:flex-row items-center p-5 sm:p-6 gap-5 sm:gap-6">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden relative shrink-0 border border-white/10">
                    <Image src={c.image} alt={c.name} fill className="object-cover" />
                  </div>
                  <div className="space-y-2 text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-bold text-white font-[family-name:var(--font-outfit)]">{c.name}</h3>
                    <p className="text-xs font-semibold text-[#E50914]">{c.role}</p>
                    <p className="text-[11px] text-gray-400">{c.experience} • {c.rank}</p>
                    <p className="text-xs text-gray-300 leading-relaxed pt-1">{c.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FAQ PREVIEW */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4">
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

        {/* 10. FINAL CTA BANNER */}
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
                href="/membership"
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-white text-[#0A0B0E] font-black text-sm sm:text-base hover:bg-gray-100 transition-all shadow-xl inline-flex items-center gap-2"
              >
                Enroll in Academy <Sparkles className="w-5 h-5 text-[#E50914]" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
