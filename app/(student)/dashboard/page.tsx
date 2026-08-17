"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { StudentShell } from "@/components/student/student-shell";
import {
  Video,
  Award,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  BookOpen,
  User,
} from "lucide-react";

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Student";

  // Mock Active Enrollment & Live Class Data
  const [liveClassLink, setLiveClassLink] = useState<string | null>(
    "https://meet.google.com/selffits-live-class"
  );
  const [isClassActive, setIsClassActive] = useState<boolean>(true);

  const studentData = {
    programName: "Adults Martial Arts - Blue Belt Tier",
    beltLevel: "Blue Belt",
    remainingClasses: 18,
    totalClasses: 24,
    daysRemaining: 42,
    membershipStatus: "ACTIVE",
    expiryDate: "October 15, 2026",
    nextClassTime: "Today at 7:00 PM IST",
    instructor: "Sensei Rahul Sharma",
  };

  return (
    <StudentShell>
      <div className="space-y-8">
        {/* 1. WELCOME HERO CARD */}
        <div className="relative rounded-3xl p-5 sm:p-8 bg-gradient-to-r from-[#1E2330] via-[#14161D] to-[#0F1117] border border-white/15 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#E50914]/20 to-[#0080FF]/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0080FF]/15 text-[#0080FF] text-xs font-bold border border-[#0080FF]/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Active Student • {studentData.beltLevel} Student
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-gray-400 text-sm max-w-xl">
                Ready for your training session today? Keep up your discipline and track your belt progression.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-[#0A0B0E]/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0 w-full sm:w-auto justify-around sm:justify-start">
              <div className="text-center px-2 sm:px-4 border-r border-white/10">
                <p className="text-xs text-gray-400">Current Belt</p>
                <p className="text-base sm:text-lg font-black text-[#0080FF]">{studentData.beltLevel}</p>
              </div>
              <div className="text-center px-2 sm:px-4">
                <p className="text-xs text-gray-400">Classes Remaining</p>
                <p className="text-base sm:text-lg font-black text-[#10B981]">
                  {studentData.remainingClasses} / {studentData.totalClasses}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. TODAY'S LIVE CLASS HERO BANNER (CRITICAL UI WORKFLOW) */}
        <div className="rounded-3xl p-5 sm:p-8 bg-[#14161D] border-2 border-[#E50914] shadow-2xl shadow-[#E50914]/15 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981]"></span>
                </span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#10B981]">
                  LIVE CLASS SCHEDULED TODAY
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
                {studentData.programName}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#0080FF]" />
                  {studentData.nextClassTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#E50914]" />
                  Instructor: {studentData.instructor}
                </span>
              </div>
            </div>

            {/* JOIN CLASS TRIGGER */}
            <div className="w-full lg:w-auto text-center lg:text-right space-y-2">
              {liveClassLink ? (
                <a
                  href={liveClassLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-black text-sm sm:text-base hover:opacity-95 transition-all shadow-xl shadow-[#10B981]/25 inline-flex items-center justify-center gap-3 hover:scale-[1.02] cursor-pointer"
                >
                  <Video className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                  JOIN LIVE CLASS NOW
                </a>
              ) : (
                <div className="p-4 rounded-xl bg-[#0F1117] border border-white/10 text-xs text-gray-400">
                  Live link will be available 15 minutes before class.
                </div>
              )}
              <p className="text-[11px] text-gray-400">
                Broadcasting via Google Meet & Zoom • Form Evaluation Active
              </p>
            </div>
          </div>
        </div>

        {/* 3. METRICS & STATUS WIDGETS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-[#14161D] border border-white/10 p-5 sm:p-6 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Subscription Progress</span>
              <BookOpen className="w-4 h-4 text-[#0080FF]" />
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl sm:text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
                  {studentData.remainingClasses} Left
                </h3>
                <span className="text-xs text-gray-400">
                  {studentData.totalClasses - studentData.remainingClasses} / {studentData.totalClasses} Done
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#0F1117] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0080FF] to-[#10B981] rounded-full"
                  style={{
                    width: `${((studentData.totalClasses - studentData.remainingClasses) / studentData.totalClasses) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#14161D] border border-white/10 p-5 sm:p-6 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Plan Validity</span>
              <Calendar className="w-4 h-4 text-[#E50914]" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
                {studentData.daysRemaining} Days Left
              </h3>
              <p className="text-xs text-gray-400 mt-1">Expires on {studentData.expiryDate}</p>
            </div>
          </div>

          <div className="bg-[#14161D] border border-white/10 p-5 sm:p-6 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Earned Certifications</span>
              <Award className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
                  1 Certificate
                </h3>
                <p className="text-xs text-gray-400 mt-1">Yellow Belt Verified</p>
              </div>
              <Link
                href="/dashboard/certificates"
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#0080FF] font-semibold"
              >
                View
              </Link>
            </div>
          </div>
        </div>

        {/* 4. QUICK ACTIONS GRID */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Link
              href="/dashboard/live"
              className="p-5 rounded-2xl bg-[#14161D] border border-white/10 hover:border-[#E50914] transition-all text-center space-y-2 group"
            >
              <Video className="w-6 h-6 text-[#E50914] mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-white">Class Timetable</p>
            </Link>
            <Link
              href="/dashboard/programs"
              className="p-5 rounded-2xl bg-[#14161D] border border-white/10 hover:border-[#0080FF] transition-all text-center space-y-2 group"
            >
              <BookOpen className="w-6 h-6 text-[#0080FF] mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-white">My Programs</p>
            </Link>
            <Link
              href="/dashboard/certificates"
              className="p-5 rounded-2xl bg-[#14161D] border border-white/10 hover:border-[#F59E0B] transition-all text-center space-y-2 group"
            >
              <Award className="w-6 h-6 text-[#F59E0B] mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-white">Download Certs</p>
            </Link>
            <Link
              href="/dashboard/profile"
              className="p-5 rounded-2xl bg-[#14161D] border border-white/10 hover:border-[#10B981] transition-all text-center space-y-2 group"
            >
              <User className="w-6 h-6 text-[#10B981] mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-white">Update Profile</p>
            </Link>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
