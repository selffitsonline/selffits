"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Settings, Save, CheckCircle2, ShieldCheck, Database, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("SELFFITS - Global Virtual Martial Arts & Fitness Academy");
  const [contactEmail, setContactEmail] = useState("support@selffits.com");
  const [contactPhone, setContactPhone] = useState("+91 98765 43210");
  const [currencyMode, setCurrencyMode] = useState("MULTI");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <AdminShell>
      <div className="space-y-6 max-w-3xl mx-auto relative">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            System & Website Settings
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Global system configurations, contact metadata, database parameters, and platform defaults.
          </p>
        </div>


        <form onSubmit={handleSave} className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
              Website Brand Title
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#0080FF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                Support Email Address
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#0080FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                Support Phone / WhatsApp
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#0080FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
              Currency Gateway Standard
            </label>
            <select
              value={currencyMode}
              onChange={(e) => setCurrencyMode(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#0080FF]"
            >
              <option value="MULTI">Multi-Currency (INR ₹ & International USD $)</option>
              <option value="INR_ONLY">Domestic Only (INR ₹)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`relative overflow-hidden w-full py-4 rounded-xl text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                isSaved
                  ? "bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[#10B981]/30 ring-2 ring-[#10B981]/50 scale-[1.02]"
                  : "bg-gradient-to-r from-[#0080FF] to-[#2563EB] hover:from-[#0070E0] hover:to-[#1D4ED8] shadow-[#0080FF]/25"
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white animate-bounce shrink-0" />
                  <span>Saved Live!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 shrink-0" />
                  <span>Save System Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}

