"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { RazorpayCheckout } from "@/components/public/razorpay-checkout";
import { ShieldCheck, Check, Calendar, Clock, Sparkles } from "lucide-react";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "blue-belt";
  const freqParam = searchParams.get("freq") || "3";
  const daysParam = searchParams.get("days") || "Sunday,Wednesday,Saturday";
  const batchParam = searchParams.get("batch") || "2nd Batch — 02:30 PM to 03:30 PM (GMT)";
  const currencyParam = (searchParams.get("currency") as "INR" | "USD") || "USD";
  const priceParam = searchParams.get("price") || "55";

  const daysPerWeek = parseInt(freqParam, 10) || 3;
  const selectedDays = daysParam.split(",").map((d) => d.trim()).filter(Boolean);
  const selectedBatch = batchParam;
  const priceNum = parseFloat(priceParam) || 55;

  const planName = `${daysPerWeek} ${daysPerWeek === 1 ? "Day" : "Days"} / Week Membership Plan`;

  return (
    <main className="flex-grow pt-28 pb-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-[#E50914] px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/30">
          Secure Student Enrollment Checkout
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-[family-name:var(--font-outfit)]">
          Complete Your Academy Enrollment
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Confirm your training schedule selection and proceed to secure checkout.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Order & Schedule Summary Column */}
        <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white font-[family-name:var(--font-outfit)]">
              Enrollment Summary
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-[#0080FF]/15 text-[#0080FF] border border-[#0080FF]/30 text-xs font-bold">
              Central Schedule Configured
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between text-sm">
              <span className="text-gray-400 font-semibold">Selected Membership Plan:</span>
              <span className="font-extrabold text-white text-right">{planName}</span>
            </div>

            <div className="flex items-start justify-between text-sm">
              <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0080FF]" /> Weekly Training Days:
              </span>
              <span className="font-extrabold text-[#0080FF] text-right">
                {selectedDays.join(", ")}
              </span>
            </div>

            <div className="flex items-start justify-between text-sm">
              <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#10B981]" /> Preferred Batch Timing:
              </span>
              <span className="font-extrabold text-white text-right max-w-[200px]">
                {selectedBatch}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
              <span className="text-gray-400 font-semibold">Timezone Standard:</span>
              <span className="font-bold text-gray-200">GMT (UTC+0)</span>
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
              <span className="text-gray-400 font-semibold">Monthly Price:</span>
              <span className="text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
                ${priceNum}
                <span className="text-xs text-gray-400 font-normal"> / month</span>
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E50914]" /> Included in Your Membership:
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981]" /> 100% Live Virtual Classroom Sessions
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981]" /> Real-Time Form Correction & Mentorship
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981]" /> Official Belt Graduation Certification
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
            planName={planName}
            priceUSD={priceNum}
            scheduleData={{
              daysPerWeek,
              selectedDays,
              selectedBatch,
              monthlyPrice: priceNum,
              timezone: "GMT (UTC+0)",
            }}
          />
        </div>
      </section>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />
      <Suspense fallback={<div className="pt-32 text-center text-white font-bold">Loading checkout details...</div>}>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </div>
  );
}
