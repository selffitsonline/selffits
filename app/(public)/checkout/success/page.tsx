"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { CheckCircle2, ArrowRight, Sparkles, ShieldCheck, Video, Award } from "lucide-react";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "plan-3-day";
  const [countdown, setCountdown] = useState(10);

  const plansData: Record<string, any> = {
    "plan-1-day": { name: "1 Day / Week Membership", duration: "1 Month Access (4 Live Classes / Month)" },
    "plan-2-day": { name: "2 Days / Week Membership", duration: "1 Month Access (8 Live Classes / Month)" },
    "plan-3-day": { name: "3 Days / Week Membership", duration: "1 Month Access (12 Live Classes / Month)" },
    "plan-4-day": { name: "4 Days / Week Membership", duration: "1 Month Access (16 Live Classes / Month)" },
    "plan-5-day": { name: "5 Days / Week Membership", duration: "1 Month Access (20 Live Classes / Month)" },
  };

  const selectedPlan = plansData[planId] || plansData["plan-3-day"];

  // 10-Second Auto-Redirect Countdown to Student Dashboard
  useEffect(() => {
    if (countdown <= 0) {
      router.push("/dashboard?enrolled=true&enrollment=success");
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-28 pb-20 flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-[#14161D] border border-white/15 rounded-3xl p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden space-y-6">
          {/* Glow Accents */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-tr from-[#10B981]/20 to-[#0080FF]/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Animated Success Badge */}
          <div className="relative z-10 flex flex-col items-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-[#10B981]/15 border-2 border-[#10B981] flex items-center justify-center text-[#10B981] shadow-xl shadow-[#10B981]/20 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-bold border border-[#10B981]/30">
              <Sparkles className="w-3.5 h-3.5" />
              Enrollment Payment Confirmed
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-[family-name:var(--font-outfit)] text-white tracking-tight">
              Thank You for Your Enrollment! 🎉
            </h1>

            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-md">
              Welcome to SELFFITS Academy! Your transaction was successful and your live virtual classroom access has been activated.
            </p>
          </div>

          {/* Order Receipt Box */}
          <div className="relative z-10 p-5 rounded-2xl bg-[#0F1117] border border-white/10 text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-gray-400">Enrolled Program:</span>
              <span className="font-extrabold text-white text-sm">{selectedPlan.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Class Access:</span>
              <span className="font-semibold text-[#0080FF]">{selectedPlan.duration}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Live Platform:</span>
              <span className="font-semibold text-[#10B981]">Google Meet & Zoom</span>
            </div>
          </div>

          {/* Auto-Redirect Indicator & Instant CTA Button */}
          <div className="relative z-10 space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span>Redirecting to Student Dashboard in {countdown} seconds...</span>
            </div>

            <Link
              href="/dashboard?enrolled=true&enrollment=success"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-black text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/25 flex items-center justify-center gap-2"
            >
              Go to Student Dashboard Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="relative z-10 flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>Instant Access • Verified SELFFITS Certificate Track</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
