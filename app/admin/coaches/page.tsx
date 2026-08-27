"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCardsSkeleton } from "@/components/admin/admin-skeletons";
import { UserCheck, Mail, Phone, Award, ShieldCheck, FileText } from "lucide-react";
import { getAdminCoachesAction } from "@/actions/admin.actions";
import { fetchAdminDataWithCache } from "@/lib/admin-cache";

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCoaches() {
      try {
        const res = await fetchAdminDataWithCache("admin_coaches", getAdminCoachesAction);
        if (isMounted && res && res.success && res.coaches) {
          setCoaches(res.coaches);
        }
      } catch (err) {
        console.error("Admin coaches load error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCoaches();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <AdminCardsSkeleton />;
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Active Verified Coaches Directory
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Certified instructors and master coaches approved for live virtual academy training.
            </p>
          </div>

          <Link
            href="/admin/coach-applications"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#0080FF]" /> Review Pending Leads
          </Link>
        </div>

        {!isLoading && coaches.length === 0 ? (
          <div className="rounded-3xl p-12 bg-[#14161D] border border-white/10 text-center space-y-4 max-w-xl mx-auto">
            <UserCheck className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Approved Coaches Yet</h3>
            <p className="text-xs text-gray-400">
              Review new coach applications in the Coach Leads section to approve new instructors.
            </p>
            <Link
              href="/admin/coach-applications"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0080FF] text-white font-extrabold text-xs"
            >
              View Coach Applications
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#0080FF]/15 border border-[#0080FF]/30 text-[#0080FF] flex items-center justify-center font-black text-lg">
                      {coach.fullName[0]}
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                      Certified Coach
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)]">
                      {coach.fullName}
                    </h3>
                    <p className="text-xs text-[#0080FF] font-bold mt-0.5">{coach.highestRank}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-300 pt-2 border-t border-white/10">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" /> {coach.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {coach.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-gray-400" /> {coach.experience} Experience
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Approved: {coach.createdAt}</span>
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
