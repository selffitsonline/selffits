"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { StudentShell } from "@/components/student/student-shell";
import { Video, Calendar, User, ArrowRight, ShieldCheck } from "lucide-react";

export default function StudentProgramsPage() {
  const enrolledCourses = [
    {
      id: "blue-belt-course",
      title: "Adults Martial Arts - Blue Belt Tier",
      category: "MARTIAL ARTS",
      image: "/images/adults_martial_arts.png",
      duration: "3 Months (24 Classes)",
      instructor: "Sensei Rahul Sharma",
      remainingClasses: 18,
      totalClasses: 24,
      status: "ACTIVE",
      expiryDate: "Oct 15, 2026",
    },
    {
      id: "yellow-belt-completed",
      title: "Yellow Belt Foundations",
      category: "MARTIAL ARTS",
      image: "/images/kids_martial_arts.png",
      duration: "1 Month (8 Classes)",
      instructor: "Sensei Rahul Sharma",
      remainingClasses: 0,
      totalClasses: 8,
      status: "COMPLETED",
      expiryDate: "Graduated",
    },
  ];

  return (
    <StudentShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            My Enrolled Programs
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage active belt tiers, track remaining classes, and view completed courses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {enrolledCourses.map((course) => {
            const completedCount = course.totalClasses - course.remainingClasses;
            const progressPercent = Math.round((completedCount / course.totalClasses) * 100);

            return (
              <div
                key={course.id}
                className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <Image src={course.image} alt={course.title} fill className="object-cover" />
                    <span
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        course.status === "ACTIVE"
                          ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                          : "bg-white/10 text-gray-300"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0080FF]">
                        {course.category}
                      </span>
                      <h3 className="text-xl font-bold text-white font-[family-name:var(--font-outfit)] mt-0.5">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#E50914]" />
                        Instructor: {course.instructor}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Class Progress</span>
                        <span className="font-bold text-white">
                          {completedCount} / {course.totalClasses} Classes ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#0F1117] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0080FF] to-[#10B981] rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  {course.status === "ACTIVE" ? (
                    <a
                      href="https://meet.google.com/selffits-live-class"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-extrabold text-xs text-center block hover:opacity-95 transition-all shadow-md shadow-[#10B981]/20 flex items-center justify-center gap-2"
                    >
                      <Video className="w-4 h-4 fill-current" />
                      JOIN LIVE CLASS NOW <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <Link
                      href="/dashboard/certificates"
                      className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-xs text-center block hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      View Belt Certificate <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </StudentShell>
  );
}
