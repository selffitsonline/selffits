"use client";

import React from "react";
import { StudentShell } from "@/components/student/student-shell";

export function DashboardSkeleton() {
  return (
    <StudentShell>
      <div className="space-y-8 animate-pulse">
        {/* Hero Card Skeleton */}
        <div className="rounded-3xl p-6 sm:p-8 bg-[#14161D] border border-white/10 space-y-4">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="space-y-3 flex-grow">
              <div className="w-32 h-6 rounded-full bg-white/10" />
              <div className="w-64 h-8 sm:h-10 rounded-xl bg-white/10" />
              <div className="w-80 h-4 rounded-lg bg-white/5" />
            </div>
            <div className="w-full lg:w-72 h-14 rounded-2xl bg-white/10" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-white/5 p-3 space-y-2">
                <div className="w-12 h-3 rounded bg-white/10" />
                <div className="w-20 h-5 rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>

        {/* Content Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 rounded-3xl bg-[#14161D] border border-white/10 p-6 space-y-4">
              <div className="w-48 h-6 rounded-lg bg-white/10" />
              <div className="w-full h-32 rounded-2xl bg-white/5" />
              <div className="w-full h-12 rounded-xl bg-white/10" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-64 rounded-3xl bg-[#14161D] border border-white/10 p-6 space-y-4">
              <div className="w-36 h-6 rounded-lg bg-white/10" />
              <div className="w-full h-40 rounded-2xl bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
