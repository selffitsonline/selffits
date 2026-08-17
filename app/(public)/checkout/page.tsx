"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { RazorpayCheckout } from "@/components/public/razorpay-checkout";
import { ShieldCheck, Check, Video, Award } from "lucide-react";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "blue-belt";

  const plansData: Record<string, any> = {
    "yellow-belt": { name: "Yellow Belt Tier", priceINR: 2999, priceUSD: 39, duration: "1 Month (8 Live Classes)" },
    "blue-belt": { name: "Blue Belt Tier", priceINR: 7999, priceUSD: 99, duration: "3 Months (24 Live Classes)" },
    "purple-belt": { name: "Purple Belt Tier", priceINR: 13999, priceUSD: 179, duration: "6 Months (48 Live Classes)" },
    "brown-belt": { name: "Brown Belt Tier", priceINR: 24999, priceUSD: 319, duration: "12 Months (96 Live Classes)" },
    "challenge-8": { name: "8 Day Challenge", priceINR: 1499, priceUSD: 19, duration: "8 Days (8 Live Workouts)" },
    "challenge-24": { name: "24 Day Challenge", priceINR: 3999, priceUSD: 49, duration: "24 Days (24 Live Workouts)" },
    "transformation-96": { name: "96 Day Transformation", priceINR: 13999, priceUSD: 169, duration: "96 Days (96 Live Workouts)" },
  };

  const selectedPlan = plansData[planId] || plansData["blue-belt"];

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
            Secure Enrollment Checkout
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-[family-name:var(--font-outfit)]">
            Complete Your Academy Enrollment
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            You are one step away from joining live training sessions with Sensei Rahul & Master Sarah.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Order Summary Column */}
          <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold text-white font-[family-name:var(--font-outfit)] border-b border-white/10 pb-4">
              Enrollment Summary
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Selected Program:</span>
                <span className="font-bold text-white">{selectedPlan.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Duration & Classes:</span>
                <span className="font-semibold text-[#0080FF]">{selectedPlan.duration}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Class Platform:</span>
                <span className="font-semibold text-[#10B981]">Google Meet & Zoom Live</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                Included in Your Membership:
              </h4>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981]" /> 100% Live Interactive Stream Sessions
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981]" /> Real-Time Technique & Stance Correction
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981]" /> Official Belt Graduation Certificate
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981]" /> Access to Student Dashboard & Timetables
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Gateway Form Column */}
          <div>
            <RazorpayCheckout
              planId={planId}
              planName={selectedPlan.name}
              priceINR={selectedPlan.priceINR}
              priceUSD={selectedPlan.priceUSD}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
