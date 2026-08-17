"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Layers, Plus, Edit3, Trash2, Check, ShieldCheck } from "lucide-react";

export default function AdminMembershipsPage() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [memberships, setMemberships] = useState([
    {
      id: "mem-1",
      name: "Yellow Belt Tier",
      duration: "1 Month",
      totalClasses: 8,
      priceINR: "2,999",
      priceUSD: "39",
      status: "ACTIVE",
      features: ["8 Live Classes", "Google Meet / Zoom Access", "Yellow Belt Cert"],
    },
    {
      id: "mem-2",
      name: "Blue Belt Tier",
      duration: "3 Months",
      totalClasses: 24,
      priceINR: "7,999",
      priceUSD: "99",
      status: "ACTIVE",
      features: ["24 Live Classes", "Google Meet / Zoom Access", "Blue Belt Cert"],
    },
    {
      id: "mem-3",
      name: "Purple Belt Tier",
      duration: "6 Months",
      totalClasses: 48,
      priceINR: "13,999",
      priceUSD: "179",
      status: "ACTIVE",
      features: ["48 Live Classes", "1-on-1 Form Evaluation", "Purple Belt Cert"],
    },
    {
      id: "mem-4",
      name: "Brown Belt Tier",
      duration: "12 Months",
      totalClasses: 96,
      priceINR: "24,999",
      priceUSD: "319",
      status: "ACTIVE",
      features: ["96 Live Classes", "Weaponry & Kata Drills", "Brown Belt Cert"],
    },
  ]);

  const toggleStatus = (id: string) => {
    setMemberships(
      memberships.map((m) =>
        m.id === id ? { ...m, status: m.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : m
      )
    );
    setSuccessMsg("Plan status updated!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Membership Management
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Configure membership plan tiers, duration rules, features list, and active availability.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" /> {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memberships.map((m) => (
            <div key={m.id} className="bg-[#14161D] border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">{m.name}</h3>
                  <p className="text-xs text-gray-400">{m.duration} • {m.totalClasses} Live Classes</p>
                </div>
                <button
                  onClick={() => toggleStatus(m.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                    m.status === "ACTIVE"
                      ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  {m.status}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>Pricing: <strong className="text-white">₹{m.priceINR} / ${m.priceUSD}</strong></span>
                <span>Features Count: {m.features.length}</span>
              </div>

              <ul className="space-y-1 text-xs text-gray-400">
                {m.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0080FF]" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
