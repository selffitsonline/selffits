"use client";

import React from "react";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminStudentProgressLoading() {
  return (
    <AdminShell>
      <div className="space-y-6 animate-pulse">
        {/* Page Header Skeleton */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#0080FF]/20 border border-[#0080FF]/40" />
              <div className="w-72 h-8 rounded-xl bg-white/10" />
            </div>
            <div className="w-96 max-w-full h-4 rounded-lg bg-white/5" />
          </div>
          <div className="w-36 h-10 rounded-xl bg-white/5 border border-white/10" />
        </div>

        {/* Batch Selection & Filters Skeleton Workspace */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#14161D] border border-[#0080FF]/20 space-y-5">
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0080FF]/20 border border-[#0080FF]/40" />
              <div className="space-y-1.5">
                <div className="w-24 h-3 rounded bg-[#0080FF]/30" />
                <div className="w-48 h-5 rounded-lg bg-white/10" />
              </div>
            </div>

            {/* Filter Toolbar Skeletons */}
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="w-48 h-10 rounded-xl bg-[#0F1117] border border-white/10" />
              <div className="w-40 h-10 rounded-xl bg-[#0F1117] border border-white/10" />
              <div className="w-36 h-10 rounded-xl bg-[#0F1117] border border-white/10" />
              <div className="w-32 h-10 rounded-xl bg-[#0F1117] border border-white/10" />
              <div className="w-32 h-10 rounded-xl bg-[#0F1117] border border-white/10" />
            </div>
          </div>
        </div>

        {/* Student Progress Directory Table Skeleton */}
        <div className="bg-[#14161D] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="w-60 h-6 rounded-lg bg-white/10" />
            <div className="w-28 h-6 rounded-full bg-white/5" />
          </div>

          <div className="space-y-3 pt-2">
            {/* Table Header Placeholder */}
            <div className="h-10 rounded-xl bg-white/5 px-4 flex items-center justify-between">
              <div className="w-32 h-3 rounded bg-white/10" />
              <div className="w-28 h-3 rounded bg-white/10 hidden sm:block" />
              <div className="w-24 h-3 rounded bg-white/10 hidden md:block" />
              <div className="w-20 h-3 rounded bg-white/10 hidden lg:block" />
              <div className="w-20 h-3 rounded bg-white/10" />
            </div>

            {/* Table Row Skeletons */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-[#0F1117] border border-white/5 p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="w-36 h-4 rounded bg-white/10" />
                    <div className="w-48 h-3 rounded bg-white/5" />
                  </div>
                </div>

                <div className="w-28 h-5 rounded-md bg-white/10 hidden sm:block" />
                <div className="w-24 h-6 rounded-full bg-white/10 hidden md:block" />
                <div className="w-20 h-6 rounded-full bg-white/10 hidden lg:block" />

                <div className="flex items-center gap-2">
                  <div className="w-28 h-8 rounded-xl bg-[#0080FF]/20 border border-[#0080FF]/30" />
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
