"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { ShieldCheck, Video, Award, Heart, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        {/* Page Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
            Our Story & Mission
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-[family-name:var(--font-outfit)]">
            About SELFFITS Academy
          </h1>
          <p className="text-gray-400 text-base max-w-2xl mx-auto">
            Democratizing authentic martial arts & high-intensity fitness training globally through real-time virtual classrooms.
          </p>
        </section>

        {/* Story Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold font-[family-name:var(--font-outfit)] text-white">
              From Local Studio to Global Live Virtual Academy
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              SELFFITS began with a simple observation: millions of kids, adults, and women around the world want to learn genuine martial arts and achieve peak fitness, but lack access to local high-caliber instructors or face schedule constraints.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              We pioneered an interactive live academy framework over Google Meet and Zoom where students receive instant form feedback from certified black belt senseis and master trainers. No pre-recorded videos — every session is live, engaging, and disciplined.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm font-semibold text-white">
                <CheckCircle2 className="w-5 h-5 text-[#E50914]" />
                <span>Over 2,000 active students trained across 15+ countries.</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-white">
                <CheckCircle2 className="w-5 h-5 text-[#0080FF]" />
                <span>Dedicated skills evaluation system & official downloadable certificates.</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-white">
                <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                <span>Tailored programs for Kids, Adults, and Ladies Only batches.</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src="/images/adults_martial_arts.png"
              alt="SELFFITS Master Instructor"
              width={600}
              height={450}
              className="w-full h-[400px] object-cover"
            />
          </div>
        </section>

        {/* Pillars Section */}
        <section className="bg-[#0E1015] border-y border-white/10 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl font-extrabold font-[family-name:var(--font-outfit)]">
                Our Core Pillars
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#14161D] border border-white/10 p-6 rounded-2xl space-y-3">
                <Video className="w-8 h-8 text-[#E50914]" />
                <h3 className="text-lg font-bold text-white">100% Live Streaming</h3>
                <p className="text-xs text-gray-400">Interactive virtual sessions ensuring accountability and real-time guidance.</p>
              </div>
              <div className="bg-[#14161D] border border-white/10 p-6 rounded-2xl space-y-3">
                <ShieldCheck className="w-8 h-8 text-[#0080FF]" />
                <h3 className="text-lg font-bold text-white">Strict Form Standards</h3>
                <p className="text-xs text-gray-400">Coaches correct postures live to prevent injury and build real martial technique.</p>
              </div>
              <div className="bg-[#14161D] border border-white/10 p-6 rounded-2xl space-y-3">
                <Award className="w-8 h-8 text-[#10B981]" />
                <h3 className="text-lg font-bold text-white">Recognized Progression</h3>
                <p className="text-xs text-gray-400">Clear curriculum progression with verifiable program completion certificates.</p>
              </div>
              <div className="bg-[#14161D] border border-white/10 p-6 rounded-2xl space-y-3">
                <Heart className="w-8 h-8 text-[#F59E0B]" />
                <h3 className="text-lg font-bold text-white">Inclusive Environment</h3>
                <p className="text-xs text-gray-400">Safe, empowering batches for kids, adults, and women of all fitness levels.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 text-center px-4">
          <Link
            href="/membership"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-bold text-base hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/25 inline-block"
          >
            Start Your Training Today
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
