"use client";

import React, { useState, useEffect } from "react";
import { StudentShell } from "@/components/student/student-shell";
import { Award, ShieldCheck, Calendar, RefreshCw, Download, FileText, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { getStudentDashboardProgressAction } from "@/actions/student-progress.actions";

const BELT_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  "White Belt": { bg: "bg-gray-200/20", text: "text-gray-200", border: "border-gray-400/30" },
  "Yellow Belt": { bg: "bg-amber-400/20", text: "text-amber-300", border: "border-amber-400/40" },
  "Orange Belt": { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/40" },
  "Green Belt": { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/40" },
  "Blue Belt": { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/40" },
  "Purple Belt": { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/40" },
  "Brown Belt": { bg: "bg-amber-800/30", text: "text-amber-400", border: "border-amber-700/50" },
  "Black Belt": { bg: "bg-red-950/40", text: "text-red-400", border: "border-red-600/50" },
};

export default function StudentProgressPage() {
  const [progressData, setProgressData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = async () => {
    setLoading(true);
    const res = await getStudentDashboardProgressAction();
    if (res.success && res.progress) {
      setProgressData(res.progress);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const currentBelt = progressData?.currentBelt || "White Belt";
  const beltStyle = BELT_COLOR_MAP[currentBelt] || BELT_COLOR_MAP["White Belt"];

  return (
    <StudentShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)] flex items-center gap-3">
              <Award className="w-8 h-8 text-[#0080FF]" /> My Training Belt & Certificate Progress
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Track your current belt rank, batch examination schedule, and official graduation certificates.
            </p>
          </div>

          <button
            onClick={loadProgress}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0080FF] ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 space-y-3 bg-[#14161D] rounded-3xl border border-white/10">
            <RefreshCw className="w-8 h-8 text-[#0080FF] animate-spin mx-auto" />
            <p className="text-xs font-bold">Loading your belt progress and batch schedule...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW CARDS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CURRENT BELT CARD */}
              <div className="lg:col-span-2 bg-gradient-to-br from-[#14161D] to-[#0F1117] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden shadow-2xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#0080FF]/20 text-[#0080FF] border border-[#0080FF]/30 text-[10px] font-black uppercase tracking-wider">
                      Current Belt Level
                    </span>
                    <span className="text-xs text-gray-400">
                      Awarded: <strong className="text-white">{progressData?.beltAwardedAt}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <span
                      className={`px-5 py-2.5 rounded-full text-2xl font-black border uppercase tracking-wider ${beltStyle.bg} ${beltStyle.text} ${beltStyle.border}`}
                    >
                      🥋 {currentBelt}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-extrabold">Active Program</span>
                    <p className="font-extrabold text-white text-sm mt-0.5">{progressData?.activeProgramTitle}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-extrabold">Assigned Batch</span>
                    <p className="font-extrabold text-[#0080FF] text-sm mt-0.5">{progressData?.assignedBatchName}</p>
                  </div>
                </div>
              </div>

              {/* BATCH EXAM SCHEDULE CARD */}
              <div className="bg-[#14161D] border border-white/10 p-6 rounded-3xl space-y-5 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-extrabold">Batch Exam Date</span>
                      <h4 className="text-sm font-extrabold text-white">Upcoming Belt Evaluation</h4>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0F1117] border border-white/5 space-y-2">
                    {progressData?.upcomingExamDate ? (
                      <div>
                        <p className="text-lg font-black text-amber-400">{progressData.upcomingExamDate}</p>
                        <div className="mt-2">
                          {progressData.isExamDatePassed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Exam Date Reached
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black border border-amber-500/30">
                              <Clock className="w-3.5 h-3.5" /> Scheduled Exam Date
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No exam date configured for your batch yet.</p>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 bg-[#0F1117] p-3 rounded-xl border border-white/5 space-y-0.5">
                  <p>Batch Target Belt: <strong className="text-amber-300">🥋 {progressData?.assignedBatchBeltLevel}</strong></p>
                  <p className="text-gray-500">Managed via Batch Management</p>
                </div>
              </div>
            </div>

            {/* ISSUED CERTIFICATES SECTION */}
            <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#F59E0B]" /> Official Issued Certificates
                  </h3>
                  <p className="text-xs text-gray-400">View and download your official graduation and belt level certificates.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black">
                  {progressData?.totalCertificates || 0} Certificate(s)
                </span>
              </div>

              {!progressData?.certificates || progressData.certificates.length === 0 ? (
                <div className="p-8 text-center bg-[#0F1117] rounded-2xl border border-white/5 space-y-2">
                  <FileText className="w-8 h-8 text-gray-600 mx-auto opacity-50" />
                  <p className="text-xs font-bold text-gray-300">No certificates issued to you yet.</p>
                  <p className="text-[11px] text-gray-500">
                    Certificates will appear here once issued by your head coach after your batch examination.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {progressData.certificates.map((cert: any) => (
                    <div
                      key={cert.id}
                      className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                            🥋 {cert.beltName}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] text-[9px] font-black">
                            VERIFIED
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-white mt-1">{cert.title}</h4>
                        <p className="text-[11px] text-gray-400">{cert.programTitle}</p>

                        <div className="text-[10px] text-gray-400 space-y-0.5 bg-[#14161D] p-2.5 rounded-xl border border-white/5 font-mono">
                          <p>ID: <span className="text-gray-200">{cert.certificateNumber}</span></p>
                          <p>Issued: <span className="text-gray-200">{cert.issuedDate}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <a
                          href={`${cert.fileUrl}?inline=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 border border-white/10"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#0080FF]" /> View
                        </a>
                        <a
                          href={cert.fileUrl}
                          download
                          className="flex-1 py-2 rounded-xl bg-[#0080FF]/20 hover:bg-[#0080FF]/30 text-[#0080FF] text-xs font-bold transition-all flex items-center justify-center gap-1 border border-[#0080FF]/30"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </StudentShell>
  );
}
