"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StudentShell } from "@/components/student/student-shell";
import { Video, Calendar, User, ArrowRight, ShieldCheck, BookOpen, Trash2, AlertTriangle, X } from "lucide-react";
import { cancelStudentEnrollmentAction } from "@/actions/payments.actions";
import { clearStudentEnrollmentCache } from "@/lib/enrollment-cache";

interface StudentProgramsViewProps {
  initialCourses: any[];
}

export function StudentProgramsView({ initialCourses }: StudentProgramsViewProps) {
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>(initialCourses || []);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);

  const confirmDeleteProgram = async () => {
    if (!courseToDelete) return;

    setIsDeleting(true);
    const res = await cancelStudentEnrollmentAction(courseToDelete.id);
    if (res.success) {
      clearStudentEnrollmentCache();
      setEnrolledCourses((prev) => prev.filter((item) => item.id !== courseToDelete.id));
      setCourseToDelete(null);
    } else {
      alert(res.error || "Failed to delete program.");
    }
    setIsDeleting(false);
  };

  return (
    <StudentShell>
      <div className="space-y-6 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0080FF] px-2.5 py-1 rounded-full bg-[#0080FF]/15 border border-[#0080FF]/30">
              Virtual Academy Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)] mt-2">
              My Enrolled Programs & Belt Tiers
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Track live class progress, instructor assignments, and active program validity.
            </p>
          </div>

          <Link
            href="/programs"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-[#0080FF]/25 flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" /> Explore New Programs
          </Link>
        </div>

        {/* Delete Confirmation Modal */}
        {courseToDelete && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#14161D] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#E50914]/20 border border-[#E50914]/40 text-[#EF4444] flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                  Delete Expired Program?
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Are you sure you want to delete the expired program &quot;<span className="text-white font-semibold">{courseToDelete.title}</span>&quot; from your dashboard history? This action is permanent.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCourseToDelete(null)}
                  className="w-1/2 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteProgram}
                  disabled={isDeleting}
                  className="w-1/2 py-3 rounded-xl bg-[#E50914] hover:bg-[#B91C1C] text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#E50914]/30 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Deleting..." : "Yes, Delete Expired"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Programs Grid */}
        {enrolledCourses.length === 0 ? (
          <div className="rounded-3xl p-12 bg-[#14161D] border border-white/10 text-center space-y-4 max-w-md mx-auto shadow-2xl">
            <BookOpen className="w-10 h-10 text-gray-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No Enrolled Programs Yet</h3>
            <p className="text-xs text-gray-400">
              When you enroll in a martial arts belt tier or fitness challenge, your active course will appear here.
            </p>
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0080FF] text-white font-extrabold text-xs"
            >
              Browse Programs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enrolledCourses.map((course) => {
              const completedCount = course.totalClasses - course.remainingClasses;
              const progressPercent = Math.round((completedCount / (course.totalClasses || 1)) * 100);
              const isExpired = course.status === "EXPIRED" || course.status === "COMPLETED" || course.remainingClasses <= 0 || course.daysRemaining <= 0;

              return (
                <div
                  key={course.id}
                  className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden">
                      <Image src={course.image || "/images/adults_martial_arts.png"} alt={course.title} fill className="object-cover" />
                      <span
                        className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          !isExpired
                            ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 backdrop-blur-md"
                            : "bg-[#E50914]/20 text-[#EF4444] border border-[#E50914]/30 backdrop-blur-md"
                        }`}
                      >
                        {isExpired ? "EXPIRED" : "ACTIVE"}
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
                            className={`h-full rounded-full ${isExpired ? "bg-red-500" : "bg-gradient-to-r from-[#0080FF] to-[#10B981]"}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    {!isExpired ? (
                      <a
                        href={course.liveClassLink || "https://meet.google.com/selffits-live-class"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-extrabold text-xs text-center block hover:opacity-95 transition-all shadow-md shadow-[#10B981]/20 flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4 fill-current" />
                        JOIN LIVE CLASS NOW <ArrowRight className="w-4 h-4" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="flex-grow py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-bold text-xs text-center block">
                          Course Validity Expired
                        </span>

                        <button
                          type="button"
                          onClick={() => setCourseToDelete({ id: course.id, title: course.title })}
                          className="px-4 py-3 rounded-xl bg-[#E50914]/20 hover:bg-[#E50914]/40 text-[#EF4444] border border-[#E50914]/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                          title="Delete Expired Program"
                        >
                          <Trash2 className="w-4 h-4 text-[#EF4444]" />
                          Delete Expired
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentShell>
  );
}
