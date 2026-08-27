"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Video, Save, CheckCircle2, Link as LinkIcon } from "lucide-react";

export default function AdminLiveClassLinksPage() {
  const [meetingUrl, setMeetingUrl] = useState("https://meet.google.com/selffits-live-class");
  const [platform, setPlatform] = useState("GOOGLE_MEET");
  const [notes, setNotes] = useState("Regular adult martial arts & fitness live training batch.");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <AdminShell>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Live Class Meeting Link Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Update the active Google Meet / Zoom virtual classroom link broadcasted across student dashboards.
          </p>
        </div>

        {isSaved && (
          <div className="p-4 rounded-xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Live class meeting link updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
              Virtual Classroom Link (URL)
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#0080FF]"
              />
              <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                Platform Type
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#0080FF]"
              >
                <option value="GOOGLE_MEET">Google Meet</option>
                <option value="ZOOM">Zoom Cloud Meetings</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                Batch Target
              </label>
              <input
                type="text"
                disabled
                value="All Active Student Enrollments"
                className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-gray-400 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
              Instructor Notes / Class Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#0080FF]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#0080FF]/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Broadcast Live Meeting Link
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
