"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { CheckCircle2, ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";

export default function CoachApplicationSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-28 pb-20 flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-[#14161D] border border-white/15 rounded-3xl p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden space-y-6">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-tr from-[#E50914]/20 to-[#0080FF]/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Icon Badge */}
          <div className="relative z-10 flex flex-col items-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-[#10B981]/15 border-2 border-[#10B981] flex items-center justify-center text-[#10B981] shadow-xl shadow-[#10B981]/20 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-bold border border-[#10B981]/30">
              <Sparkles className="w-3.5 h-3.5" />
              Coach Application Received
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-[family-name:var(--font-outfit)] text-white tracking-tight">
              Thank You for Applying!
            </h1>
          </div>

          {/* Main Confirmation Paragraphs */}
          <div className="relative z-10 p-6 rounded-2xl bg-[#0F1117] border border-white/10 text-gray-300 text-xs sm:text-sm leading-relaxed space-y-4 text-center">
            <p className="font-semibold text-white">
              Your application to become a SELFFITS Coach has been successfully submitted.
            </p>
            <p className="text-gray-300">
              Our team will carefully review your application and qualifications. We will get back to you using the contact details you provided.
            </p>
            <p className="text-gray-400 italic">
              Thank you for your interest in joining SELFFITS.
            </p>
          </div>

          {/* Redirect CTA Button */}
          <div className="relative z-10 pt-2">
            <Link
              href="/"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-base hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/25 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          <div className="relative z-10 flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-2 border-t border-white/10">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>SELFFITS Global Coach Recruitment Portal</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
