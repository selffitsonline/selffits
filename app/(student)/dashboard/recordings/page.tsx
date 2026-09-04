"use client";

import React from "react";
import Image from "next/image";
import { StudentShell } from "@/components/student/student-shell";
import { PlayCircle, Clock, User } from "lucide-react";

export default function StudentRecordingsPage() {
  const recordings = [
    {
      id: "rec-1",
      title: "Advanced Kicking Combos & Spinning Back Kick",
      date: "Aug 5, 2026",
      duration: "55 Mins",
      instructor: "Sensei Rahul Sharma",
      image: "/images/adults_martial_arts.png",
    },
    {
      id: "rec-2",
      title: "Stance Stability & Self Defense Block Drills",
      date: "Aug 3, 2026",
      duration: "50 Mins",
      instructor: "Sensei Rahul Sharma",
      image: "/images/kids_martial_arts.png",
    },
    {
      id: "rec-3",
      title: "HIIT Fat Loss Workout & Core Shredding",
      date: "Jul 30, 2026",
      duration: "45 Mins",
      instructor: "Sarah Jenkins",
      image: "/images/weight_loss_hiit.png",
    },
  ];

  return (
    <StudentShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Recorded Class Archive
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Review past live class technique breakdowns and workout sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recordings.map((rec) => (
            <div
              key={rec.id}
              className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden group hover:border-[#0080FF]/50 transition-all"
            >
              <div className="relative h-44 overflow-hidden border-b border-white/10">
                <Image src={rec.image} alt={rec.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <PlayCircle className="w-12 h-12 text-white/90 group-hover:text-[#E50914] transition-colors cursor-pointer" />
                </div>
                <span className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#0080FF]" /> {rec.duration}
                </span>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                  {rec.title}
                </h3>
                <div className="text-[11px] text-gray-400 space-y-1">
                  <p className="flex items-center gap-1">
                    <User className="w-3 h-3 text-[#E50914]" /> {rec.instructor}
                  </p>
                  <p>Recorded on {rec.date}</p>
                </div>
                <button className="w-full py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-[#0080FF] hover:border-[#0080FF] text-white text-xs font-bold transition-all cursor-pointer">
                  Watch Recording
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentShell>
  );
}
