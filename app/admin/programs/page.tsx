"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCardsSkeleton } from "@/components/admin/admin-skeletons";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";
import { getAdminProgramsAction, updateAdminProgramPricingAction } from "@/actions/admin.actions";
import { fetchAdminDataWithCache, clearAdminCacheKey } from "@/lib/admin-cache";

export default function AdminProgramsManagementPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPrograms() {
      try {
        const res = await fetchAdminDataWithCache("admin_programs", getAdminProgramsAction);
        if (isMounted && res && res.success && res.programs) {
          setPrograms(res.programs);
        }
      } catch (err) {
        console.error("Admin programs load error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadPrograms();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePriceChange = (id: string, field: "priceINR" | "priceUSD" | "isActive", value: any) => {
    setPrograms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSaveProgram = async (program: any) => {
    setSavingId(program.id);
    setMsg(null);

    const res = await updateAdminProgramPricingAction(
      program.id,
      Number(program.priceINR),
      Number(program.priceUSD),
      program.isActive
    );

    if (res.success) {
      clearAdminCacheKey("admin_programs");
      setMsg({ type: "success", text: `${program.name} updated successfully!` });
    } else {
      setMsg({ type: "error", text: res.error || "Failed to update program." });
    }
    setSavingId(null);
  };

  if (isLoading) {
    return <AdminCardsSkeleton />;
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Course & Program Pricing Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Single source of truth for course pricing (INR & USD), active status, and class quotas.
          </p>
        </div>

        {msg && (
          <div
            className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
              msg.type === "success"
                ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                : "bg-[#E50914]/15 text-[#EF4444] border border-[#E50914]/30"
            }`}
          >
            {msg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{msg.text}</span>
          </div>
        )}

        <div className="space-y-4">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-1.5 flex-grow">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#0080FF]/20 text-[#0080FF] border border-[#0080FF]/30">
                    {prog.category}
                  </span>
                  <span className="text-xs text-gray-400 font-bold">• {prog.totalClasses} Live Classes</span>
                </div>

                <h3 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)]">
                  {prog.name}
                </h3>

                <p className="text-xs text-gray-400">
                  Enrolled Students: <span className="text-white font-bold">{prog.enrolledStudents}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 shrink-0">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    INR Price (₹)
                  </label>
                  <input
                    type="number"
                    value={prog.priceINR}
                    onChange={(e) => handlePriceChange(prog.id, "priceINR", e.target.value)}
                    className="w-28 h-9 px-3 rounded-lg bg-[#0F1117] border border-white/10 text-white font-mono text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    USD Price ($)
                  </label>
                  <input
                    type="number"
                    value={prog.priceUSD}
                    onChange={(e) => handlePriceChange(prog.id, "priceUSD", e.target.value)}
                    className="w-28 h-9 px-3 rounded-lg bg-[#0F1117] border border-white/10 text-white font-mono text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() => handlePriceChange(prog.id, "isActive", !prog.isActive)}
                    className={`h-9 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      prog.isActive
                        ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                        : "bg-white/10 text-gray-400 border border-white/10"
                    }`}
                  >
                    {prog.isActive ? "Active" : "Disabled"}
                  </button>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => handleSaveProgram(prog)}
                    disabled={savingId === prog.id}
                    className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white font-bold text-xs hover:opacity-95 transition-all shadow-md shadow-[#0080FF]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingId === prog.id ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
