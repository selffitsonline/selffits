"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { updateDailyLiveLinkAction } from "@/actions/live-links.actions";
import { Video, Check, Save, Link2, Clock, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminLiveLinksPage() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingBatchId, setLoadingBatchId] = useState<string | null>(null);

  const [batches, setBatches] = useState([
    {
      id: "cl-kids-morning",
      program: "Kids Martial Arts (Morning Batch)",
      schedule: "MON, WED, FRI • 09:00 AM IST",
      platform: "GOOGLE_MEET" as "GOOGLE_MEET" | "ZOOM",
      meetingUrl: "https://meet.google.com/kids-morning-class",
      updatedAt: "Today at 08:30 AM",
    },
    {
      id: "cl-adults-evening",
      program: "Adults Martial Arts (Evening Batch)",
      schedule: "MON, WED, FRI • 07:00 PM IST",
      platform: "GOOGLE_MEET" as "GOOGLE_MEET" | "ZOOM",
      meetingUrl: "https://meet.google.com/selffits-live-class",
      updatedAt: "Today at 06:15 PM",
    },
    {
      id: "cl-ladies-hiit",
      program: "Ladies Only HIIT (Evening Batch)",
      schedule: "TUE, THU, SAT • 06:00 PM IST",
      platform: "ZOOM" as "GOOGLE_MEET" | "ZOOM",
      meetingUrl: "https://zoom.us/j/9876543210",
      updatedAt: "Yesterday at 05:45 PM",
    },
    {
      id: "cl-weightloss-hiit",
      program: "Weight Loss Challenge (Morning Batch)",
      schedule: "DAILY • 07:00 AM IST",
      platform: "GOOGLE_MEET" as "GOOGLE_MEET" | "ZOOM",
      meetingUrl: "https://meet.google.com/hiit-morning-shred",
      updatedAt: "Today at 06:30 AM",
    },
  ]);

  const handleUrlChange = (id: string, newUrl: string) => {
    setBatches(batches.map((b) => (b.id === id ? { ...b, meetingUrl: newUrl } : b)));
  };

  const handlePlatformChange = (id: string, platform: "GOOGLE_MEET" | "ZOOM") => {
    setBatches(batches.map((b) => (b.id === id ? { ...b, platform } : b)));
  };

  const handlePublish = async (batch: typeof batches[0]) => {
    setLoadingBatchId(batch.id);
    setSuccessMsg(null);
    setErrorMsg(null);

    const res = await updateDailyLiveLinkAction({
      liveClassId: batch.id,
      meetingUrl: batch.meetingUrl,
      platform: batch.platform,
    });

    if (!res.success) {
      setErrorMsg(res.error || "Failed to publish meeting link.");
      setLoadingBatchId(null);
      return;
    }

    setSuccessMsg(`Published today's link for "${batch.program}" successfully!`);
    setLoadingBatchId(null);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <AdminShell>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Daily Live Class Link Controller
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Publish today&apos;s Google Meet & Zoom class URLs per batch. Updates reflect immediately on student dashboards.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 text-[#EF4444] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          {batches.map((batch) => {
            const isSaving = loadingBatchId === batch.id;
            return (
              <div
                key={batch.id}
                className="bg-[#14161D] border border-white/10 p-6 rounded-2xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white font-[family-name:var(--font-outfit)]">
                      {batch.program}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#0080FF]" /> {batch.schedule}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={batch.platform}
                      onChange={(e) => handlePlatformChange(batch.id, e.target.value as any)}
                      className="px-3 py-1 rounded bg-[#0F1117] border border-white/10 text-white text-[11px] font-bold"
                    >
                      <option value="GOOGLE_MEET">Google Meet</option>
                      <option value="ZOOM">Zoom</option>
                    </select>

                    <span className="px-2.5 py-1 rounded bg-[#10B981]/20 text-[#10B981] text-[10px] font-extrabold border border-[#10B981]/30">
                      ACTIVE TODAY
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <input
                      type="url"
                      value={batch.meetingUrl}
                      onChange={(e) => handleUrlChange(batch.id, e.target.value)}
                      placeholder="Paste Google Meet (meet.google.com/...) or Zoom link..."
                      className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#E50914]"
                    />
                    <Link2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-4" />
                  </div>

                  <button
                    onClick={() => handlePublish(batch)}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-bold text-xs hover:opacity-95 transition-opacity shadow-md shadow-[#E50914]/20 flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Publishing..." : "Publish Link"}
                  </button>
                </div>

                <p className="text-[11px] text-gray-500">
                  Last updated: {batch.updatedAt}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
