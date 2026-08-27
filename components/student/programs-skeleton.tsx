"use client";

import React from "react";
import { StudentShell } from "@/components/student/student-shell";

export function ProgramsSkeleton() {
  return (
    <StudentShell>
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="w-56 h-8 rounded-xl bg-white/10" />
          <div className="w-80 h-4 rounded-lg bg-white/5" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden space-y-4 p-5"
            >
              <div className="w-full h-44 rounded-xl bg-white/10" />
              <div className="space-y-2">
                <div className="w-24 h-4 rounded bg-white/10" />
                <div className="w-64 h-6 rounded bg-white/10" />
                <div className="w-40 h-4 rounded bg-white/5" />
              </div>
              <div className="w-full h-2 rounded-full bg-white/10" />
              <div className="w-full h-12 rounded-xl bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </StudentShell>
  );
}
