"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { StudentShell } from "@/components/student/student-shell";
import {
  Video,
  Award,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  User,
  Sparkles,
  ExternalLink,
  Layers,
  AlertCircle,
} from "lucide-react";
import { getStudentBatchInfoAction } from "@/actions/batch.actions";

interface StudentDashboardViewProps {
  userName: string;
  userEmail?: string | null;
  initialIsEnrolled: boolean;
  initialEnrollment: any;
}

export function StudentDashboardView({
  userName,
  userEmail,
  initialIsEnrolled,
  initialEnrollment,
}: StudentDashboardViewProps) {
  const [isEnrolled, setIsEnrolled] = useState<boolean>(initialIsEnrolled);
  const [activeStudentData, setActiveStudentData] = useState(
    initialEnrollment || {
      programName: "Adults Martial Arts - Blue Belt Tier",
      beltLevel: "Blue Belt",
      remainingClasses: 18,
      totalClasses: 24,
      daysRemaining: 42,
      membershipStatus: "ACTIVE",
      expiryDate: "October 15, 2026",
      nextClassTime: "Today at 7:00 PM IST",
      instructor: "Sensei Rahul Sharma",
    }
  );

  const [batchInfo, setBatchInfo] = useState<any | null>(null);
  const [loadingBatch, setLoadingBatch] = useState<boolean>(true);

  useEffect(() => {
    async function loadBatchData() {
      try {
        const res = await getStudentBatchInfoAction();
        if (res && res.success && res.hasBatch) {
          setBatchInfo(res.batch);
        }
      } catch (err) {
        console.error("Error loading student batch info:", err);
      } finally {
        setLoadingBatch(false);
      }
    }
    loadBatchData();
  }, []);

  const completedClasses = activeStudentData.totalClasses - activeStudentData.remainingClasses;
  const progressPercentage = Math.min(
    100,
    Math.round((completedClasses / (activeStudentData.totalClasses || 24)) * 100)
  );

  // Check if batch is ready with an active admin-assigned meeting URL
  const isMeetingActive = !!(batchInfo && batchInfo.meetingUrl && batchInfo.status !== "INACTIVE");

  return (
    <StudentShell>
      <div className="space-y-8">
        {/* 1. WELCOME HERO CARD */}
        <div className="relative rounded-3xl p-5 sm:p-8 bg-gradient-to-r from-[#1E2330] via-[#14161D] to-[#0F1117] border border-white/15 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#E50914]/20 to-[#0080FF]/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0080FF]/15 text-[#0080FF] text-xs font-bold border border-[#0080FF]/30">
                <Sparkles className="w-3.5 h-3.5" /> SELFFITS Student Academy Portal
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-[family-name:var(--font-outfit)]">
                Welcome Back, <span className="text-[#0080FF]">{userName}</span> 👋
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
                {isEnrolled
                  ? `Your live virtual training membership is active. You have ${activeStudentData.remainingClasses} classes remaining in your ${activeStudentData.beltLevel} tier.`
                  : "Explore certified live martial arts & virtual fitness programs. Enroll today to start your journey."}
              </p>
            </div>

            {!isEnrolled && (
              <Link
                href="/programs"
                className="w-full lg:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white font-black text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#0080FF]/25 flex items-center justify-center gap-3 shrink-0 active:scale-95"
              >
                Browse & Enroll Programs
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Quick Metrics Bar */}
          {isEnrolled && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10 relative z-10">
              <div className="bg-[#0F1117]/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Current Rank Tier
                </span>
                <span className="text-sm font-extrabold text-[#0080FF] flex items-center gap-1.5 mt-0.5">
                  <Award className="w-4 h-4 text-[#0080FF]" /> {batchInfo?.levelName || activeStudentData.beltLevel}
                </span>
              </div>

              <div className="bg-[#0F1117]/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Classes Remaining
                </span>
                <span className="text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                  <BookOpen className="w-4 h-4 text-[#10B981]" /> {activeStudentData.remainingClasses} / {activeStudentData.totalClasses}
                </span>
              </div>

              <div className="bg-[#0F1117]/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Membership Validity
                </span>
                <span className="text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4 text-[#F59E0B]" /> {activeStudentData.daysRemaining} Days
                </span>
              </div>

              <div className="bg-[#0F1117]/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Account Status
                </span>
                <span className="text-sm font-extrabold text-[#10B981] flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" /> ACTIVE MEMBER
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 2. ACTIVE ENROLLMENT / PROGRAM DETAIL CARD */}
        {isEnrolled ? (
          <div className="w-full bg-[#14161D] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0080FF] px-2.5 py-1 rounded-full bg-[#0080FF]/15 border border-[#0080FF]/30">
                  Enrolled Active Program
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)] mt-2">
                  {batchInfo?.programTitle || activeStudentData.programName}
                </h2>
              </div>

              <Link
                href="/dashboard/programs"
                className="text-xs text-[#0080FF] hover:underline font-bold flex items-center gap-1"
              >
                Manage All Programs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">Training Class Attendance Progress</span>
                <span className="font-extrabold text-white">{progressPercentage}% Completed</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#0F1117] overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0080FF] to-[#10B981] transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#0F1117] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Next Scheduled Class</span>
                <p className="text-xs font-extrabold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0080FF]" />{" "}
                  {batchInfo
                    ? `${batchInfo.dayCombination} • ${batchInfo.clockTiming}`
                    : activeStudentData.nextClassTime}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F1117] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Assigned Instructor</span>
                <p className="text-xs font-extrabold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#E50914]" />{" "}
                  {batchInfo?.coachName || activeStudentData.instructor}
                </p>
              </div>
            </div>

            {/* Preparation Information Panel (Automatically Visible BEFORE Meeting Link is Active) */}
            {!isMeetingActive && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1A1812] via-[#14161D] to-[#0F1117] border border-[#F59E0B]/30 space-y-2 shadow-lg animate-in fade-in duration-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white font-[family-name:var(--font-outfit)]">
                      Your Class Is Being Prepared
                    </h3>
                    <span className="text-[10px] font-semibold text-[#F59E0B]">
                      You&apos;ll be notified when your virtual classroom is ready to join.
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed pt-1 pl-10">
                  Our team is currently organizing your training session. We&apos;ll get back to you soon once your batch and live class are ready.
                </p>
              </div>
            )}

            {/* Meeting Button (Disabled when inactive, Active when ready) */}
            {isMeetingActive ? (
              <a
                href={batchInfo.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider text-center block transition-all shadow-lg shadow-[#10B981]/20 flex items-center justify-center gap-2 hover:opacity-95 cursor-pointer transform hover:scale-[1.01]"
              >
                <Video className="w-4 h-4 fill-current" /> Join Virtual Classroom Session
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <button
                disabled
                type="button"
                className="w-full py-4 rounded-2xl bg-white/10 border border-white/10 text-gray-400 font-extrabold text-xs sm:text-sm uppercase tracking-wider text-center flex items-center justify-center gap-2 opacity-60 cursor-not-allowed pointer-events-none"
              >
                <Video className="w-4 h-4" /> Join Virtual Classroom Session (Not Ready)
              </button>
            )}
          </div>
        ) : (
          /* Un-enrolled Student View */
          <div className="rounded-3xl p-8 sm:p-12 bg-[#14161D] border border-white/10 text-center space-y-6 max-w-2xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#0080FF]/15 text-[#0080FF] border border-[#0080FF]/30 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
                No Active Program Enrollment Found
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
                You are registered as a student on SELFFITS. Choose a belt tier or fitness challenge program to unlock live interactive classes and instructor access.
              </p>
            </div>
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-[#0080FF]/25 hover:opacity-95 transition-all"
            >
              Explore All Martial Arts & Fitness Programs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </StudentShell>
  );
}
