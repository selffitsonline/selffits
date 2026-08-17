"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { BookOpen, DollarSign, Edit3, Save, Check } from "lucide-react";

export default function AdminProgramsPage() {
  const [plans, setPlans] = useState([
    { id: "yb-1", name: "Yellow Belt", duration: "1 Month", classes: 8, priceINR: "2,999", priceUSD: "39", active: true },
    { id: "bb-3", name: "Blue Belt", duration: "3 Months", classes: 24, priceINR: "7,999", priceUSD: "99", active: true },
    { id: "pb-6", name: "Purple Belt", duration: "6 Months", classes: 48, priceINR: "13,999", priceUSD: "179", active: true },
    { id: "brb-12", name: "Brown Belt", duration: "12 Months", classes: 96, priceINR: "24,999", priceUSD: "319", active: true },
  ]);

  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handlePriceUpdate = (id: string, inr: string, usd: string) => {
    setPlans(plans.map((p) => (p.id === id ? { ...p, priceINR: inr, priceUSD: usd } : p)));
    setSavedMsg("Pricing updated successfully!");
    setTimeout(() => setSavedMsg(null), 3000);
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Programs & Membership Pricing Manager
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure program catalog pricing in INR (₹) and USD ($), live class allocations, and tier availability.
          </p>
        </div>

        {savedMsg && (
          <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" /> {savedMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-[#14161D] border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">{plan.name}</h3>
                  <p className="text-xs text-gray-400">{plan.duration} • {plan.classes} Classes</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#10B981]/20 text-[#10B981] text-[10px] font-bold">
                  ACTIVE PLAN
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Price (INR ₹)</label>
                  <input
                    type="text"
                    defaultValue={plan.priceINR}
                    id={`inr-${plan.id}`}
                    className="w-full h-10 px-3 rounded-lg bg-[#0F1117] border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Price (USD $)</label>
                  <input
                    type="text"
                    defaultValue={plan.priceUSD}
                    id={`usd-${plan.id}`}
                    className="w-full h-10 px-3 rounded-lg bg-[#0F1117] border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  const inrEl = document.getElementById(`inr-${plan.id}`) as HTMLInputElement;
                  const usdEl = document.getElementById(`usd-${plan.id}`) as HTMLInputElement;
                  handlePriceUpdate(plan.id, inrEl.value, usdEl.value);
                }}
                className="w-full py-2.5 rounded-xl bg-[#0080FF] text-white text-xs font-bold hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Save Pricing
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
