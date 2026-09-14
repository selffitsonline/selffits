"use client";

import React from "react";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminBatchesLoading() {
  return (
    <AdminShell>
      <div className="space-y-6 animate-pulse">
        {/* Header Bar Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="w-64 h-8 rounded-xl bg-white/10" />
            <div className="w-96 max-w-full h-4 rounded-lg bg-white/5" />
          </div>
          <div className="w-40 h-10 rounded-xl bg-[#0080FF]/30 border border-[#0080FF]/40" />
        </div>

        {/* 4 Status Tabs Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-[#14161D] border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white/10" />
                <div className="w-24 h-4 rounded bg-white/10" />
              </div>
              <div className="w-8 h-5 rounded-full bg-white/10" />
            </div>
          ))}
        </div>

        {/* Filter Controls Toolbar Skeleton */}
        <div className="p-4 rounded-2xl bg-[#14161D] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="w-full md:w-80 h-10 rounded-xl bg-[#0F1117] border border-white/10" />
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-32 h-9 rounded-xl bg-[#0F1117] border border-white/10" />
            <div className="w-28 h-9 rounded-xl bg-[#0F1117] border border-white/10" />
            <div className="w-28 h-9 rounded-xl bg-[#0F1117] border border-white/10" />
            <div className="w-36 h-9 rounded-xl bg-[#0F1117] border border-white/10" />
          </div>
        </div>

        {/* Batches Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top Header & Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-24 h-5 rounded-full bg-white/10" />
                  <div className="w-16 h-5 rounded-full bg-white/10" />
                </div>

                {/* Batch Name & Program */}
                <div className="space-y-2">
                  <div className="w-48 h-6 rounded-lg bg-white/10" />
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-4 rounded bg-[#0080FF]/30" />
                    <div className="w-20 h-4 rounded bg-amber-400/20" />
                  </div>
                </div>

                {/* Assigned Coach Box Skeleton */}
                <div className="p-3 rounded-xl bg-[#0F1117] border border-white/5 space-y-2">
                  <div className="w-28 h-3 rounded bg-white/10" />
                  <div className="w-36 h-4 rounded bg-white/10" />
                </div>

                {/* Schedule Info Skeleton */}
                <div className="space-y-2">
                  <div className="w-40 h-4 rounded bg-white/5" />
                  <div className="w-32 h-4 rounded bg-white/5" />
                </div>

                {/* Capacity Progress Bar Skeleton */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-3 rounded bg-white/10" />
                    <div className="w-20 h-3 rounded bg-white/10" />
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10" />
                </div>
              </div>

              {/* Actions Footer Skeleton */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex-1 h-9 rounded-xl bg-white/5 border border-white/10" />
                <div className="w-20 h-9 rounded-xl bg-[#0080FF]/20 border border-[#0080FF]/30" />
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Bar Skeleton */}
        <div className="p-4 rounded-2xl bg-[#14161D] border border-white/10 flex items-center justify-between">
          <div className="w-48 h-4 rounded bg-white/10" />
          <div className="w-36 h-8 rounded-xl bg-white/5" />
        </div>
      </div>
    </AdminShell>
  );
}
