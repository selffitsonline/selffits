"use client";

import React from "react";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminProgramsLoading() {
  return (
    <AdminShell>
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        {/* Header & Action Button Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="w-48 h-5 rounded-full bg-[#0080FF]/20 border border-[#0080FF]/30" />
            <div className="w-96 max-w-full h-8 rounded-xl bg-white/10" />
            <div className="w-80 max-w-full h-4 rounded-lg bg-white/5" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-36 h-10 rounded-xl bg-white/10" />
            <div className="w-48 h-10 rounded-xl bg-[#0080FF]/30 border border-[#0080FF]/40" />
          </div>
        </div>

        {/* Category Context Navigation Bar Skeleton */}
        <div className="bg-[#14161D] p-3 rounded-2xl border border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-40 h-10 rounded-xl bg-[#E50914]/20 border border-[#E50914]/30" />
              <div className="w-48 h-10 rounded-xl bg-white/5 border border-white/10" />
            </div>

            <div className="flex items-center gap-2 bg-[#0F1117] p-1.5 rounded-xl border border-white/10">
              <div className="w-16 h-8 rounded-lg bg-[#0080FF]/30" />
              <div className="w-20 h-8 rounded-lg bg-white/5" />
              <div className="w-20 h-8 rounded-lg bg-white/5" />
            </div>
          </div>
        </div>

        {/* Section View Tabs Skeleton */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <div className="w-56 h-9 rounded-xl bg-[#0080FF]/20 border border-[#0080FF]/30" />
          <div className="w-52 h-9 rounded-xl bg-white/5 border border-white/10" />
        </div>

        {/* Schedule Builder & Pricing Controls Content Skeleton */}
        <div className="space-y-8">
          {/* Weekly Training Days Card Skeleton */}
          <div className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="space-y-1.5 border-b border-white/10 pb-3">
              <div className="w-64 h-5 rounded-lg bg-white/10" />
              <div className="w-80 h-3 rounded bg-white/5" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-[#0A0B0E] border border-white/10 p-3 space-y-2">
                  <div className="w-16 h-4 rounded bg-white/10" />
                  <div className="w-20 h-4 rounded-full bg-white/5" />
                </div>
              ))}
            </div>
          </div>

          {/* Class Batch Timings Manager Skeleton */}
          <div className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="space-y-1.5 border-b border-white/10 pb-3">
              <div className="w-72 h-5 rounded-lg bg-white/10" />
              <div className="w-96 h-3 rounded bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-white/10 bg-[#0A0B0E] space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="w-24 h-4 rounded bg-[#0080FF]/30" />
                    <div className="w-12 h-4 rounded bg-emerald-500/20" />
                  </div>
                  <div className="h-10 rounded-lg bg-[#14161D] border border-white/10" />
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Membership Pricing Cards Skeleton */}
          <div className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="space-y-1.5 border-b border-white/10 pb-3">
              <div className="w-80 h-5 rounded-lg bg-white/10" />
              <div className="w-96 h-3 rounded bg-white/5" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 rounded-2xl bg-[#0A0B0E] border border-white/15 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#0080FF]/20" />
                      <div className="w-36 h-5 rounded bg-white/10" />
                    </div>
                    <div className="w-24 h-6 rounded-full bg-emerald-500/20" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="h-10 rounded-lg bg-[#14161D] border border-white/10" />
                    <div className="h-10 rounded-lg bg-[#14161D] border border-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
