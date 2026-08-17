"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { AlertCircle, RefreshCw, HelpCircle, ArrowLeft } from "lucide-react";

function FailedContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "blue-belt";
  const reason = searchParams.get("reason") || "payment_cancelled";

  const getReasonMessage = () => {
    switch (reason) {
      case "cancelled":
        return "You cancelled the Razorpay payment modal before completing the transaction.";
      case "verification_failed":
        return "Payment verification failed. If your card/account was debited, please contact support for immediate manual verification.";
      default:
        return "The payment transaction could not be completed by your bank or payment provider.";
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 text-center space-y-8 bg-[#14161D] border border-[#E50914]/40 p-8 sm:p-12 rounded-3xl shadow-2xl">
      <div className="w-16 h-16 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-[#E50914]/20 text-[#E50914] text-[10px] font-extrabold uppercase tracking-widest border border-[#E50914]/30">
          Transaction Incomplete
        </span>
        <h1 className="text-2xl sm:text-4xl font-black font-[family-name:var(--font-outfit)] text-white">
          Payment Was Not Processed
        </h1>
        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
          {getReasonMessage()}
        </p>
      </div>

      <div className="p-4 rounded-xl bg-[#0F1117] border border-white/5 text-xs text-gray-400 text-left space-y-1">
        <p className="font-semibold text-white">Notice:</p>
        <p>No enrollment has been created for your account. Dashboard access to paid live classes will be granted once payment is successfully completed.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        <Link
          href={`/checkout?plan=${planId}`}
          className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-bold text-xs hover:opacity-95 transition-opacity shadow-lg shadow-[#E50914]/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Retry Payment Now
        </Link>
        <Link
          href="/contact"
          className="w-full sm:flex-1 py-3.5 rounded-xl bg-[#0F1117] border border-white/10 text-gray-300 font-bold text-xs hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
        >
          <HelpCircle className="w-4 h-4" /> Contact Support
        </Link>
      </div>

      <Link
        href="/membership"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white font-semibold pt-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Return to Membership Plans
      </Link>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />
      <main className="flex-grow pt-32 pb-20">
        <Suspense fallback={<div className="text-center text-gray-400 text-xs">Loading...</div>}>
          <FailedContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
