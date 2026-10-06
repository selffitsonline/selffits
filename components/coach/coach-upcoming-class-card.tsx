"use client";

import React, { useState } from "react";
import {
  Video,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Layers,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { CoachBatchInfo } from "@/actions/coach.actions";

interface CoachUpcomingClassCardProps {
  upcomingClass: CoachBatchInfo | null;
}

export function CoachUpcomingClassCard({ upcomingClass }: CoachUpcomingClassCardProps) {
  const [copied, setCopied] = useState(false);

  if (!upcomingClass) {
    return (
      <div className="bg-[#14161D] border border-white/10 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-500">
          <Calendar className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)]">
            No Upcoming Classes Assigned
          </h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            You do not currently have any active batches assigned. Once the academy administrator assigns you to a training batch, your upcoming live class and meeting link will appear here.
          </p>
        </div>
      </div>
    );
  }

  const { nextSession, isMeetingActive, meetingUrl } = upcomingClass;

  const handleCopyLink = () => {
    if (meetingUrl) {
      navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPlatformLabel = (url?: string | null) => {
    if (!url) return "Live Meeting";
    if (url.includes("meet.google.com")) return "Google Meet";
    if (url.includes("zoom.us")) return "Zoom Meeting";
    return "Virtual Classroom";
  };

  return (
    <div
      id="upcoming-class"
      className="relative bg-gradient-to-br from-[#1E2330] via-[#14161D] to-[#0F1117] border-2 border-[#10B981]/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#10B981]/15 to-[#0080FF]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Badges & Batch Info */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs font-black border border-[#10B981]/40 flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              UPCOMING CLASS
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-gray-300">
              {upcomingClass.batchId}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-[#0080FF]/15 text-[#0080FF] text-[10px] font-extrabold border border-[#0080FF]/30">
              {upcomingClass.beltLevel}
            </span>
            {nextSession.isToday ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#EF4444]/20 text-[#EF4444] text-[10px] font-black border border-[#EF4444]/40 animate-pulse">
                TODAY&apos;S SESSION
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-[10px] font-bold border border-[#F59E0B]/30">
                {nextSession.relativeLabel.toUpperCase()}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight">
            {upcomingClass.name}
          </h2>

          <p className="text-xs sm:text-sm text-gray-300">
            Program:{" "}
            <span className="text-[#0080FF] font-bold">{upcomingClass.programTitle}</span>{" "}
            <span className="text-gray-400">({upcomingClass.programCategory})</span>
          </p>
        </div>

        {/* Meeting Platform Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 font-semibold flex items-center gap-2">
            <Video className="w-4 h-4 text-[#10B981]" />
            {getPlatformLabel(meetingUrl)}
          </span>
        </div>
      </div>

      {/* Grid of Key Schedule Details */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Date & Day */}
        <div className="p-4 rounded-2xl bg-[#0F1117]/90 border border-white/10 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Class Date / Day
          </span>
          <p className="text-sm font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#E50914] shrink-0" />
            <span>{nextSession.nextClassFullDate}</span>
          </p>
          <span className="text-[10px] font-semibold text-[#10B981] block">
            {nextSession.relativeLabel}
          </span>
        </div>

        {/* 2. Class Time */}
        <div className="p-4 rounded-2xl bg-[#0F1117]/90 border border-white/10 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Class Time Slot
          </span>
          <p className="text-sm font-extrabold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>{upcomingClass.clockTiming}</span>
          </p>
          <span className="text-[10px] font-semibold text-gray-400 block">
            {upcomingClass.timeSlot} Session
          </span>
        </div>

        {/* 3. Days Schedule */}
        <div className="p-4 rounded-2xl bg-[#0F1117]/90 border border-white/10 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Weekly Schedule
          </span>
          <p className="text-sm font-extrabold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0080FF] shrink-0" />
            <span className="truncate">{upcomingClass.dayCombination}</span>
          </p>
          <span className="text-[10px] font-semibold text-gray-400 block">
            {nextSession.scheduledDays.join(", ")}
          </span>
        </div>

        {/* 4. Enrolled Students */}
        <div className="p-4 rounded-2xl bg-[#0F1117]/90 border border-white/10 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Attending Students
          </span>
          <p className="text-sm font-extrabold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#F59E0B] shrink-0" />
            <span>
              {upcomingClass.studentsCount} / {upcomingClass.maxCapacity} Enrolled
            </span>
          </p>
          <span className="text-[10px] font-semibold text-[#0080FF] block">
            {upcomingClass.studentsCount > 0 ? "Ready for live instruction" : "No students yet"}
          </span>
        </div>
      </div>

      {/* Meeting Link Preview Bar */}
      {isMeetingActive && meetingUrl && (
        <div className="relative z-10 p-3.5 rounded-2xl bg-[#0F1117] border border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                Class Meeting Link (Shared with Students)
              </span>
              <p className="text-xs font-mono text-emerald-400 truncate max-w-sm sm:max-w-lg">
                {meetingUrl}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-gray-300 font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Meeting Preparation Notice (if inactive) */}
      {!isMeetingActive && (
        <div className="relative z-10 p-5 rounded-2xl bg-gradient-to-r from-[#1A1812] via-[#14161D] to-[#0F1117] border border-[#F59E0B]/30 space-y-2 shadow-lg animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white font-[family-name:var(--font-outfit)]">
                Class Meeting Link Awaiting Setup
              </h3>
              <span className="text-[10px] font-semibold text-[#F59E0B]">
                The academy administration has not set a meeting link for this batch yet.
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed pt-1 pl-10">
            Once the academy administrator adds the Google Meet or Zoom URL in the batch manager, your &quot;Join Class&quot; button will become active. Both you and your students use this exact same link.
          </p>
        </div>
      )}

      {/* Primary Action Button: "Join Class" */}
      <div className="relative z-10 w-full pt-2">
        {isMeetingActive && meetingUrl ? (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4.5 px-8 rounded-2xl bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] text-black font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#10B981]/25 hover:opacity-95 hover:scale-[1.01] active:scale-95 cursor-pointer border border-[#10B981]/40"
          >
            <Video className="w-5 h-5 fill-current" />
            <span>Join Class (Start Live Session)</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        ) : (
          <button
            disabled
            type="button"
            className="w-full py-4 px-8 rounded-2xl bg-white/10 border border-white/10 text-gray-400 font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 opacity-60 cursor-not-allowed pointer-events-none"
          >
            <Video className="w-4 h-4" />
            <span>Join Class (Not Ready — No Meeting Link)</span>
          </button>
        )}
      </div>

      {/* Attending Students Quick Preview */}
      {upcomingClass.students.length > 0 && (
        <div className="relative z-10 pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
              Attending Students in this Batch ({upcomingClass.students.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {upcomingClass.students.map((student) => (
              <div
                key={student.id}
                className="p-3 rounded-xl bg-[#0F1117] border border-white/5 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0080FF] to-[#10B981] flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{student.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{student.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
