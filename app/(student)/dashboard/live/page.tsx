"use client";

import React, { useState } from "react";
import { StudentShell } from "@/components/student/student-shell";
import { Video, Calendar, Clock, User, ShieldCheck, ExternalLink } from "lucide-react";

export default function StudentLiveClassesPage() {
  const upcomingClasses = [
    {
      id: "class-1",
      program: "Adults Martial Arts - Blue Belt Tier",
      date: "Today (Saturday)",
      time: "07:00 PM - 08:00 PM IST",
      instructor: "Sensei Rahul Sharma",
      platform: "Google Meet",
      meetingUrl: "https://meet.google.com/selffits-live-class",
      status: "LIVE_NOW",
    },
    {
      id: "class-2",
      program: "Adults Martial Arts - Blue Belt Tier",
      date: "Monday, Aug 10",
      time: "07:00 PM - 08:00 PM IST",
      instructor: "Sensei Rahul Sharma",
      platform: "Zoom",
      meetingUrl: null, // Link not posted yet
      status: "UPCOMING",
    },
    {
      id: "class-3",
      program: "Adults Martial Arts - Blue Belt Tier",
      date: "Wednesday, Aug 12",
      time: "07:00 PM - 08:00 PM IST",
      instructor: "Sensei Rahul Sharma",
      platform: "Google Meet",
      meetingUrl: null,
      status: "UPCOMING",
    },
  ];

  return (
    <StudentShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Live Virtual Class Hub
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Access today&apos;s Google Meet & Zoom class meeting links and view your upcoming training schedule.
          </p>
        </div>

        <div className="space-y-4">
          {upcomingClasses.map((item) => (
            <div
              key={item.id}
              className={`bg-[#14161D] border p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
                item.status === "LIVE_NOW"
                  ? "border-[#10B981] shadow-lg shadow-[#10B981]/10 bg-gradient-to-r from-[#14161D] to-[#0F1815]"
                  : "border-white/10"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {item.status === "LIVE_NOW" ? (
                    <span className="px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] text-[10px] font-extrabold border border-[#10B981]/30 animate-pulse">
                      🔴 LIVE NOW
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-[10px] font-bold">
                      UPCOMING
                    </span>
                  )}
                  <span className="text-xs font-semibold text-[#0080FF]">{item.platform}</span>
                </div>

                <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                  {item.program}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#E50914]" />
                    {item.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#0080FF]" />
                    {item.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-300" />
                    Instructor: {item.instructor}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {item.meetingUrl ? (
                  <a
                    href={item.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-extrabold text-sm hover:opacity-95 transition-opacity shadow-md shadow-[#10B981]/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Video className="w-4 h-4 fill-current" />
                    Join Live Class
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="px-4 py-2.5 rounded-xl bg-[#0F1117] border border-white/10 text-xs text-gray-400 italic">
                    Live link will be available before class.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentShell>
  );
}
