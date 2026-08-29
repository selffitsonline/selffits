"use client";

import React, { useState, useEffect } from "react";
import { StudentShell } from "@/components/student/student-shell";
import { Video, Calendar, Clock, User, ExternalLink, Layers, Sparkles } from "lucide-react";
import { getStudentBatchInfoAction } from "@/actions/batch.actions";

export default function StudentLiveClassesPage() {
  const [loading, setLoading] = useState(true);
  const [batchInfo, setBatchInfo] = useState<any | null>(null);

  useEffect(() => {
    async function loadStudentBatch() {
      try {
        const res = await getStudentBatchInfoAction();
        if (res && res.success && res.hasBatch) {
          setBatchInfo(res.batch);
        }
      } catch (err) {
        console.error("Failed to load student batch info:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentBatch();
  }, []);

  const isMeetingActive = !!(batchInfo && batchInfo.meetingUrl && batchInfo.status !== "INACTIVE");

  return (
    <StudentShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Live Virtual Class Hub
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Access your assigned batch live meeting link (Google Meet / Zoom) and class schedule.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 bg-[#14161D] rounded-2xl border border-white/10">
            Loading batch schedule and meeting link...
          </div>
        ) : batchInfo ? (
          <div className="space-y-6">
            {/* Main Batch Card */}
            <div className="bg-gradient-to-r from-[#14161D] via-[#14161D] to-[#0F1815] border-2 border-white/10 p-6 sm:p-8 rounded-2xl space-y-6 shadow-2xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] text-[10px] font-extrabold border border-[#10B981]/30 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                      ASSIGNED BATCH
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-gray-300">
                      {batchInfo.batchId}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#0080FF]/15 text-[#0080FF] text-[10px] font-extrabold border border-[#0080FF]/30">
                      {batchInfo.levelName}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
                    {batchInfo.name}
                  </h2>

                  <p className="text-xs text-gray-300 font-semibold">
                    Program: <span className="text-[#0080FF]">{batchInfo.programTitle}</span> ({batchInfo.programCategory})
                  </p>
                </div>
              </div>

              {/* Preparation Information Panel (Visible ABOVE meeting button when link is not ready) */}
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

              {/* Meeting Link Action Button */}
              <div className="w-full">
                {isMeetingActive ? (
                  <a
                    href={batchInfo.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-black text-base hover:opacity-95 transition-all shadow-xl shadow-[#10B981]/25 flex items-center justify-center gap-2.5 cursor-pointer transform hover:scale-[1.01]"
                  >
                    <Video className="w-5 h-5 fill-current" />
                    Join Live Class
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    disabled
                    type="button"
                    className="w-full py-4 rounded-2xl bg-white/10 border border-white/10 text-gray-400 font-extrabold text-xs sm:text-sm uppercase tracking-wider text-center flex items-center justify-center gap-2 opacity-60 cursor-not-allowed pointer-events-none"
                  >
                    <Video className="w-4 h-4" /> Join Live Class (Not Ready)
                  </button>
                )}
              </div>

              {/* Schedule & Coach Details Bar */}
              <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2.5 text-gray-300">
                  <Calendar className="w-4 h-4 text-[#E50914] shrink-0" />
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Days Schedule:</span>
                    <span className="font-bold text-white">{batchInfo.dayCombination}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-gray-300">
                  <Clock className="w-4 h-4 text-[#0080FF] shrink-0" />
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Time Slot:</span>
                    <span className="font-bold text-emerald-400">{batchInfo.timeSlot} ({batchInfo.clockTiming})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-gray-300">
                  <User className="w-4 h-4 text-gray-300 shrink-0" />
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Assigned Coach:</span>
                    <span className="font-bold text-white">{batchInfo.coachName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Default State if not assigned to batch yet */
          <div className="p-8 text-center text-gray-400 bg-[#14161D] rounded-2xl border border-white/10 space-y-3 max-w-xl mx-auto">
            <Layers className="w-12 h-12 text-gray-600 mx-auto opacity-50" />
            <h3 className="text-base font-bold text-white">No Assigned Batch Found</h3>
            <p className="text-xs text-gray-400">
              You are not currently assigned to an active class batch. Once assigned by academy administration, your batch schedule and live Google Meet / Zoom link will automatically appear here.
            </p>
          </div>
        )}
      </div>
    </StudentShell>
  );
}
