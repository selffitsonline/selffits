"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { StudentShell } from "@/components/student/student-shell";
import {
  Video,
  Award,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Lock,
  BookOpen,
  User,
  Sparkles,
  HelpCircle,
} from "lucide-react";

import { getStudentEnrollmentAction } from "@/actions/payments.actions";

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const userName = session?.user?.name || "Student";
  const userEmail = session?.user?.email;

  const [isEnrolled, setIsEnrolled] = useState<boolean>(
    () => searchParams.get("enrolled") === "true" || searchParams.get("enrollment") === "success"
  );
  const [activeStudentData, setActiveStudentData] = useState({
    programName: "Adults Martial Arts - Blue Belt Tier",
    beltLevel: "Blue Belt",
    remainingClasses: 18,
    totalClasses: 24,
    daysRemaining: 42,
    membershipStatus: "ACTIVE",
    expiryDate: "October 15, 2026",
    nextClassTime: "Today at 7:00 PM IST",
    instructor: "Sensei Rahul Sharma",
    liveClassLink: "https://meet.google.com/selffits-live-class",
  });

  React.useEffect(() => {
    async function loadEnrollment() {
      if (searchParams.get("enrolled") === "true" || searchParams.get("enrollment") === "success") {
        setIsEnrolled(true);
      }
      const res = await getStudentEnrollmentAction();
      if (res && res.isEnrolled && res.enrollment) {
        setIsEnrolled(true);
        setActiveStudentData(res.enrollment);
      }
    }
    loadEnrollment();
  }, [searchParams]);

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
                {isEnrolled ? `Active Student • ${activeStudentData.beltLevel}` : "Registered Member"}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-gray-400 text-sm max-w-xl">
                {isEnrolled
                  ? "Ready for your training session today? Keep up your discipline and track your belt progression."
                  : "Your student account is active. Select a belt tier or fitness challenge to complete enrollment and unlock live classes."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-[#0A0B0E]/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0 w-full sm:w-auto justify-around sm:justify-start">
              <div className="text-center px-2 sm:px-4 border-r border-white/10">
                <p className="text-xs text-gray-400">Enrollment Status</p>
                <p className={`text-base sm:text-lg font-black ${isEnrolled ? "text-[#10B981]" : "text-[#F59E0B]"}`}>
                  {isEnrolled ? "ENROLLED" : "PENDING"}
                </p>
              </div>
              <div className="text-center px-2 sm:px-4">
                <p className="text-xs text-gray-400">Classes Remaining</p>
                <p className="text-base sm:text-lg font-black text-white">
                  {isEnrolled ? `${activeStudentData.remainingClasses} / ${activeStudentData.totalClasses}` : "0 Classes"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. TODAY'S LIVE CLASS HERO BANNER */}
        {isEnrolled ? (
          /* ENROLLED STATE: LIVE CLASS ACTIVE & UNLOCKED */
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
                  {activeStudentData.programName}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#0080FF]" />
                    {activeStudentData.nextClassTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#E50914]" />
                    Instructor: {activeStudentData.instructor}
                  </span>
                </div>
              </div>

              {/* JOIN CLASS TRIGGER */}
              <div className="w-full lg:w-auto text-center lg:text-right space-y-2">
                <a
                  href={activeStudentData.liveClassLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-black text-sm sm:text-base hover:opacity-95 transition-all shadow-xl shadow-[#10B981]/25 inline-flex items-center justify-center gap-3 hover:scale-[1.02] cursor-pointer"
                >
                  <Video className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                  JOIN LIVE CLASS NOW
                </a>
                <p className="text-[11px] text-gray-400">
                  Broadcasting via Google Meet & Zoom • Form Evaluation Active
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* NON-ENROLLED STATE: LOCKED WITH ENROLLMENT CTA */
          <div className="rounded-3xl p-6 sm:p-8 bg-[#14161D] border border-white/15 relative overflow-hidden space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] text-xs font-extrabold border border-[#F59E0B]/30 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" />
                  No Active Program Enrolled
                </div>

                <h2 className="text-xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
                  Unlock Live Classes & Form Evaluation
                </h2>

                <p className="text-gray-300 text-sm leading-relaxed">
                  You have successfully registered your student account. Enroll in a martial arts belt tier or fitness challenge to access live Google Meet & Zoom sessions, real-time stance corrections, and official belt certifications.
                </p>
              </div>

              <div className="w-full lg:w-auto shrink-0">
                <Link
                  href="/programs"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-sm sm:text-base hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/30 inline-flex items-center justify-center gap-2.5 text-center"
                >
                  Browse Programs & Enroll Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F1117] border border-white/10 flex items-center gap-3 text-xs text-gray-400">
              <Lock className="w-4 h-4 text-[#E50914] shrink-0" />
              <span>Live class links and evaluation dashboard will unlock automatically after completing course payment.</span>
            </div>
          </div>
        )}

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
                  {isEnrolled ? `${activeStudentData.remainingClasses} Left` : "0 Classes"}
                </h3>
                <span className="text-xs text-gray-400">
                  {isEnrolled ? `${activeStudentData.totalClasses - activeStudentData.remainingClasses} / ${activeStudentData.totalClasses} Done` : "No Active Course"}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#0F1117] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0080FF] to-[#10B981] rounded-full"
                  style={{
                    width: isEnrolled ? `${((activeStudentData.totalClasses - activeStudentData.remainingClasses) / activeStudentData.totalClasses) * 100}%` : "0%",
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
                {isEnrolled ? `${activeStudentData.daysRemaining} Days Left` : "Pending Enrollment"}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {isEnrolled ? `Expires on ${activeStudentData.expiryDate}` : "Select a program to activate"}
              </p>
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
                  {isEnrolled ? "1 Certificate" : "0 Certificates"}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {isEnrolled ? "Yellow Belt Verified" : "Earned upon program completion"}
                </p>
              </div>
              {isEnrolled && (
                <Link
                  href="/dashboard/certificates"
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#0080FF] font-semibold"
                >
                  View
                </Link>
              )}
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
              href="/programs"
              className="p-5 rounded-2xl bg-[#14161D] border border-white/10 hover:border-[#E50914] transition-all text-center space-y-2 group"
            >
              <Sparkles className="w-6 h-6 text-[#E50914] mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-white">Browse Programs</p>
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
              <p className="text-xs font-bold text-white">Certificates</p>
            </Link>
            <Link
              href="/dashboard/profile"
              className="p-5 rounded-2xl bg-[#14161D] border border-white/10 hover:border-[#10B981] transition-all text-center space-y-2 group"
            >
              <User className="w-6 h-6 text-[#10B981] mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-white">My Profile</p>
            </Link>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
