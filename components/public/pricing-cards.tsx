"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StudentScheduleSelector, StudentScheduleSelectionState } from "@/components/public/student-schedule-selector";
import { ShieldCheck, Check, Zap, Sparkles } from "lucide-react";

export function PricingCards() {
  const router = useRouter();
  const [scheduleState, setScheduleState] = useState<StudentScheduleSelectionState | null>(null);

  const handleCheckout = (state: StudentScheduleSelectionState) => {
    const params = new URLSearchParams();
    params.set("freq", String(state.daysPerWeek));
    params.set("days", state.selectedDays.join(","));
    params.set("batch", state.selectedBatch);
    params.set("currency", "USD");
    params.set("price", String(state.monthlyPriceUSD));
    params.set("plan", `plan-${state.daysPerWeek}-day`);

    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Centralized Schedule & Pricing Selector */}
      <StudentScheduleSelector
        onSelectionChange={(s) => setScheduleState(s)}
        showCheckoutCta={true}
        onCheckoutSubmit={handleCheckout}
      />

      <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-2 pt-2">
        <ShieldCheck className="w-4 h-4 text-[#10B981]" />
        <span>100% Secure Database-Driven Checkout • Instant Enrollment Confirmation</span>
      </div>
    </div>
  );
}
