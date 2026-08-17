"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Globe, Save, MessageSquare, CheckCircle2 } from "lucide-react";

export default function AdminContentPage() {
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [inquiries, setInquiries] = useState([
    {
      id: "inq-1",
      name: "Michael Chang",
      email: "michael@example.com",
      phone: "+1 555-0188",
      message: "Hi, I want to enroll my 10-year-old daughter in the Kids Martial Arts morning batch. Are there open slots?",
      status: "NEW",
      date: "Today at 10:15 AM",
    },
  ]);

  const [announcementText, setAnnouncementText] = useState(
    "🔥 Enrollment Open for Fall Live Batches! Get Certified in Martial Arts Belts."
  );

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage("Announcement banner updated successfully!");
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const markResolved = (id: string) => {
    setInquiries(
      inquiries.map((inq) => (inq.id === id ? { ...inq, status: "RESOLVED" } : inq))
    );
  };

  return (
    <AdminShell>
      <div className="space-y-8 max-w-5xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Website Content & Inquiry Inbox
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage website banner announcements, hero texts, and respond to incoming visitor contact queries.
          </p>
        </div>

        {savedMessage && (
          <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {savedMessage}
          </div>
        )}

        {/* Announcement Bar Settings */}
        <div className="bg-[#14161D] border border-white/10 p-8 rounded-3xl space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <Globe className="w-5 h-5 text-[#0080FF]" />
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
              Homepage Top Announcement Banner
            </h2>
          </div>

          <form onSubmit={handleSaveAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Banner Message Text
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs focus:outline-none focus:border-[#0080FF]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0080FF] text-white font-bold text-xs hover:opacity-95 transition-opacity shadow-md shadow-[#0080FF]/20 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Update Announcement Text
            </button>
          </form>
        </div>

        {/* Contact Inquiry Inbox */}
        <div className="bg-[#14161D] border border-white/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#E50914]" />
              <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                Visitor Contact Inquiries ({inquiries.length})
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div key={inq.id} className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{inq.name}</h4>
                    <p className="text-xs text-gray-400">{inq.email} • {inq.phone}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      inq.status === "NEW"
                        ? "bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/30"
                        : "bg-[#10B981]/20 text-[#10B981]"
                    }`}
                  >
                    {inq.status}
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed bg-[#14161D] p-3 rounded-xl border border-white/5">
                  &quot;{inq.message}&quot;
                </p>

                {inq.status === "NEW" && (
                  <button
                    onClick={() => markResolved(inq.id)}
                    className="px-4 py-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981] text-xs font-bold hover:bg-[#10B981] hover:text-black transition-colors cursor-pointer"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
