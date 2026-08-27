"use client";

import React from "react";
import { AdminShell } from "@/components/admin/admin-shell";

export function AdminDashboardSkeleton() {
  return (
    <AdminShell>
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="w-48 h-5 rounded-full bg-white/10" />
          <div className="w-80 h-8 rounded-xl bg-white/10" />
          <div className="w-96 h-4 rounded-lg bg-white/5" />
        </div>

        {/* 4 Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#14161D] border border-white/10 space-y-3">
              <div className="flex justify-between">
                <div className="w-24 h-4 rounded bg-white/10" />
                <div className="w-10 h-10 rounded-xl bg-white/10" />
              </div>
              <div className="w-32 h-8 rounded-xl bg-white/10" />
              <div className="w-20 h-3 rounded bg-white/5" />
            </div>
          ))}
        </div>

        {/* 2 Tables Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((t) => (
            <div key={t} className="bg-[#14161D] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="w-48 h-5 rounded-lg bg-white/10 pb-3" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-white/5 p-3 flex justify-between">
                    <div className="w-36 h-4 rounded bg-white/10" />
                    <div className="w-20 h-4 rounded bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

export function AdminTableSkeleton({ title }: { title: string }) {
  return (
    <AdminShell>
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="w-64 h-8 rounded-xl bg-white/10" />
          <div className="w-96 h-4 rounded-lg bg-white/5" />
        </div>

        <div className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="w-full h-10 rounded-xl bg-white/10" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

export function AdminCardsSkeleton() {
  return (
    <AdminShell>
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="w-64 h-8 rounded-xl bg-white/10" />
          <div className="w-96 h-4 rounded-lg bg-white/5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/10" />
              <div className="w-40 h-6 rounded-lg bg-white/10" />
              <div className="w-full h-12 rounded-xl bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
