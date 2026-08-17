"use client";

import React from "react";
import { StudentShell } from "@/components/student/student-shell";
import { Bell, Video, Award, Calendar, Megaphone, Check } from "lucide-react";

export default function StudentNotificationsPage() {
  const notifications = [
    {
      id: "notif-1",
      type: "LIVE_CLASS",
      title: "Live Class Scheduled Today",
      message: "Adults Martial Arts - Blue Belt session starts at 7:00 PM IST on Google Meet.",
      time: "15 minutes ago",
      icon: Video,
      color: "text-[#10B981] bg-[#10B981]/15 border-[#10B981]/30",
    },
    {
      id: "notif-2",
      type: "CERTIFICATE",
      title: "Yellow Belt Certificate Available",
      message: "Congratulations! Your Yellow Belt graduation certificate has been uploaded to your account.",
      time: "2 days ago",
      icon: Award,
      color: "text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30",
    },
    {
      id: "notif-3",
      type: "MEMBERSHIP",
      title: "Membership Status Active",
      message: "Your Blue Belt 3 Month subscription is active with 18 classes remaining.",
      time: "1 week ago",
      icon: Calendar,
      color: "text-[#0080FF] bg-[#0080FF]/15 border-[#0080FF]/30",
    },
    {
      id: "notif-4",
      type: "ANNOUNCEMENT",
      title: "Academy Holiday Announcement",
      message: "Special Masterclass batch scheduled for Independence Day holiday training.",
      time: "2 weeks ago",
      icon: Megaphone,
      color: "text-[#E50914] bg-[#E50914]/15 border-[#E50914]/30",
    },
  ];

  return (
    <StudentShell>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Notifications & Announcements
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Stay updated on class reminders, certificate issuances, and academy announcements.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className="bg-[#14161D] border border-white/10 p-5 rounded-2xl flex items-start gap-4 hover:border-white/20 transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${n.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{n.title}</h3>
                    <span className="text-[10px] text-gray-500">{n.time}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </StudentShell>
  );
}
