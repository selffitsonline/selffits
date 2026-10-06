"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CoachShell } from "@/components/coach/coach-shell";
import { CoachUpcomingClassCard } from "@/components/coach/coach-upcoming-class-card";
import { CoachDashboardData, CoachBatchInfo } from "@/actions/coach.actions";
import {
  Video,
  Layers,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Award,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface CoachDashboardViewProps {
  initialData: CoachDashboardData;
}

export function CoachDashboardView({ initialData }: CoachDashboardViewProps) {
  const [data, setData] = useState<CoachDashboardData>(initialData);
  const { coach, upcomingClass, batches, totalBatchesCount, totalStudentsCount } = data;

  return (
    <CoachShell coachName={coach.fullName} highestRank={coach.highestRank}>
      <div className="space-y-8">
        {/* 1. HERO BANNER */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1E2330] via-[#14161D] to-[#0F1117] border border-white/15 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#E50914]/20 to-[#10B981]/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E50914]/15 text-[#E50914] text-xs font-bold border border-[#E50914]/30">
                <Sparkles className="w-3.5 h-3.5" /> SELFFITS Coach Academy Portal
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-[family-name:var(--font-outfit)]">
                Welcome Back, <span className="text-[#E50914]">{coach.fullName}</span> 👋
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
                Here is your live class schedule and assigned student batches. Your upcoming class meeting link matches the exact same session your students join.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="px-3.5 py-2 rounded-2xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-extrabold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                ACTIVE COACH
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10 relative z-10">
            <div className="bg-[#0F1117]/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Assigned Batches
              </span>
              <span className="text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                <Layers className="w-4 h-4 text-[#0080FF]" /> {totalBatchesCount} Active Batch{totalBatchesCount === 1 ? "" : "es"}
              </span>
            </div>

            <div className="bg-[#0F1117]/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Enrolled Students
              </span>
              <span className="text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                <Users className="w-4 h-4 text-[#10B981]" /> {totalStudentsCount} Student{totalStudentsCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="bg-[#0F1117]/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Disciplines
              </span>
              <span className="text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5 truncate">
                <Award className="w-4 h-4 text-[#F59E0B] shrink-0" />{" "}
                <span className="truncate">{coach.disciplines.length > 0 ? coach.disciplines.join(", ") : "Martial Arts & Fitness"}</span>
              </span>
            </div>

            <div className="bg-[#0F1117]/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Coach Rank
              </span>
              <span className="text-sm font-extrabold text-[#E50914] flex items-center gap-1.5 mt-0.5 truncate">
                <ShieldCheck className="w-4 h-4 text-[#E50914] shrink-0" />{" "}
                <span className="truncate">{coach.highestRank}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2. UPCOMING CLASS SECTION (PRIMARY REQUIREMENT) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)] flex items-center gap-2">
              <Video className="w-6 h-6 text-[#10B981]" />
              Upcoming Class &amp; Meeting Hub
            </h2>
            <span className="text-xs text-gray-400 font-semibold hidden sm:inline">
              Single Source of Truth: Batch Meeting Link
            </span>
          </div>

          <CoachUpcomingClassCard upcomingClass={upcomingClass} />
        </div>

        {/* 3. ALL ASSIGNED BATCHES */}
        <div id="batches" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white font-[family-name:var(--font-outfit)] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0080FF]" />
                All Assigned Batches ({batches.length})
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Batches assigned to you by the academy administration.
              </p>
            </div>
          </div>

          {batches.length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-[#14161D] rounded-2xl border border-white/10">
              No batches currently assigned.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-[#14161D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-gray-300">
                          {batch.batchId}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#0080FF]/15 text-[#0080FF] text-[10px] font-bold border border-[#0080FF]/30">
                          {batch.beltLevel}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-[10px] font-bold">
                          {batch.status}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-white font-[family-name:var(--font-outfit)]">
                        {batch.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        Program: <span className="text-white font-semibold">{batch.programTitle}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Enrolled</span>
                      <span className="text-xs font-extrabold text-emerald-400">
                        {batch.studentsCount} / {batch.maxCapacity}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/5">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Schedule</span>
                      <span className="text-gray-200 font-semibold block truncate">
                        {batch.dayCombination}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Time Slot</span>
                      <span className="text-gray-200 font-semibold block truncate">
                        {batch.clockTiming}
                      </span>
                    </div>
                  </div>

                  {/* Batch Meeting Link Action */}
                  <div className="pt-2">
                    {batch.isMeetingActive && batch.meetingUrl ? (
                      <a
                        href={batch.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-md shadow-[#10B981]/20 active:scale-95"
                      >
                        <Video className="w-4 h-4 fill-current" />
                        Join Class
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        disabled
                        type="button"
                        className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
                      >
                        <Video className="w-4 h-4" />
                        Meeting Link Not Set
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. ENROLLED STUDENTS ROSTER */}
        <div id="students" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white font-[family-name:var(--font-outfit)] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#F59E0B]" />
                Enrolled Students Roster ({totalStudentsCount})
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Students currently assigned to your training batches.
              </p>
            </div>
          </div>

          {totalStudentsCount === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-[#14161D] rounded-2xl border border-white/10">
              No students are currently assigned to your batches.
            </div>
          ) : (
            <div className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0F1117] text-gray-400 uppercase text-[10px] font-bold border-b border-white/10">
                    <tr>
                      <th className="px-5 py-3.5">Student</th>
                      <th className="px-5 py-3.5">Assigned Batch</th>
                      <th className="px-5 py-3.5">Schedule</th>
                      <th className="px-5 py-3.5">Enrolled Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {batches.flatMap((b) =>
                      b.students.map((st) => (
                        <tr key={`${b.id}-${st.id}`} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0080FF] to-[#10B981] flex items-center justify-center text-xs font-bold text-white shrink-0">
                                {st.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-extrabold text-white">{st.name}</p>
                                <p className="text-[11px] text-gray-400">{st.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-white block">{b.name}</span>
                            <span className="text-[10px] text-gray-400">{b.programTitle}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-gray-300 block">{b.dayCombination}</span>
                            <span className="text-[10px] text-emerald-400">{b.clockTiming}</span>
                          </td>
                          <td className="px-5 py-4 text-gray-400">
                            {st.assignedAt}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </CoachShell>
  );
}
