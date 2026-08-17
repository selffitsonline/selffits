"use client";

import React from "react";
import { StudentShell } from "@/components/student/student-shell";
import { BarChart3, ShieldCheck, Award, CheckCircle, Flame, Star, Zap } from "lucide-react";

export default function StudentProgressPage() {
  const stats = {
    completedClasses: 6,
    remainingClasses: 18,
    totalClasses: 24,
    attendanceRate: 100,
    currentBelt: "Blue Belt",
    nextBelt: "Purple Belt",
    streakDays: 4,
  };

  const badges = [
    { name: "Yellow Belt Master", desc: "Graduated 1st Belt Rank", icon: Award, earned: true },
    { name: "100% Attendance", desc: "Never missed a live class", icon: CheckCircle, earned: true },
    { name: "High Kicker", desc: "Completed 5 Kicking Drills", icon: Flame, earned: true },
    { name: "Purple Belt Candidate", desc: "Complete 24 Classes", icon: ShieldCheck, earned: false },
  ];

  return (
    <StudentShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            My Training Progress & Stats
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track your class attendance, streak, belt milestones, and earned achievement badges.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#14161D] border border-white/10 p-6 rounded-2xl space-y-2">
            <span className="text-xs text-gray-400">Class Attendance Rate</span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-black text-[#10B981] font-[family-name:var(--font-outfit)]">
                {stats.attendanceRate}%
              </h3>
              <Zap className="w-5 h-5 text-[#10B981]" />
            </div>
            <p className="text-[11px] text-gray-400">6 / 6 Live Classes Attended</p>
          </div>

          <div className="bg-[#14161D] border border-white/10 p-6 rounded-2xl space-y-2">
            <span className="text-xs text-gray-400">Current Belt Level</span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-black text-[#0080FF] font-[family-name:var(--font-outfit)]">
                {stats.currentBelt}
              </h3>
              <ShieldCheck className="w-5 h-5 text-[#0080FF]" />
            </div>
            <p className="text-[11px] text-gray-400">Next Rank: {stats.nextBelt}</p>
          </div>

          <div className="bg-[#14161D] border border-white/10 p-6 rounded-2xl space-y-2">
            <span className="text-xs text-gray-400">Classes Remaining</span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-black text-[#E50914] font-[family-name:var(--font-outfit)]">
                {stats.remainingClasses} Left
              </h3>
              <BarChart3 className="w-5 h-5 text-[#E50914]" />
            </div>
            <p className="text-[11px] text-gray-400">Total Plan: {stats.totalClasses} Classes</p>
          </div>

          <div className="bg-[#14161D] border border-white/10 p-6 rounded-2xl space-y-2">
            <span className="text-xs text-gray-400">Active Workout Streak</span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-black text-[#F59E0B] font-[family-name:var(--font-outfit)]">
                {stats.streakDays} Sessions
              </h3>
              <Flame className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <p className="text-[11px] text-gray-400">Keep up the daily momentum!</p>
          </div>
        </div>

        {/* Belt Progression Bar */}
        <div className="bg-[#14161D] border border-white/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
              Martial Arts Belt Roadmap
            </h3>
            <span className="text-xs text-[#0080FF] font-semibold">Rank 2 of 4</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] font-bold">
              ✓ Yellow Belt (Completed)
            </div>
            <div className="p-3 rounded-xl bg-[#0080FF]/20 border border-[#0080FF] text-[#0080FF] font-bold">
              ⚡ Blue Belt (Active)
            </div>
            <div className="p-3 rounded-xl bg-[#0F1117] border border-white/10 text-gray-500 font-semibold">
              🔒 Purple Belt
            </div>
            <div className="p-3 rounded-xl bg-[#0F1117] border border-white/10 text-gray-500 font-semibold">
              🔒 Brown Belt
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
            Achievement Badges
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {badges.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className={`p-5 rounded-2xl border flex items-center gap-4 ${
                    b.earned
                      ? "bg-[#14161D] border-white/15"
                      : "bg-[#0F1117] border-white/5 opacity-50"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      b.earned
                        ? "bg-[#E50914]/20 border border-[#E50914] text-[#E50914]"
                        : "bg-white/5 text-gray-500"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{b.name}</h4>
                    <p className="text-[11px] text-gray-400">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
