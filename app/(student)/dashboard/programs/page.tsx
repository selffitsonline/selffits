"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StudentShell } from "@/components/student/student-shell";
import { Video, Calendar, User, ArrowRight, ShieldCheck, BookOpen, Trash2, AlertTriangle, X, Lock, Info } from "lucide-react";

import { getStudentEnrollmentAction, cancelStudentEnrollmentAction } from "@/actions/payments.actions";

export default function StudentProgramsPage() {
  const searchParams = useSearchParams();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string; isExpired: boolean; remainingClasses: number } | null>(null);

  React.useEffect(() => {
    async function loadPrograms() {
      const res = await getStudentEnrollmentAction();
      if (res && res.isEnrolled && res.enrollments && res.enrollments.length > 0) {
        setEnrolledCourses(res.enrollments);
      } else if (searchParams.get("enrolled") === "true" || searchParams.get("enrollment") === "success") {
        setEnrolledCourses([
          {
            id: "purchased-belt-course",
            title: "Martial Arts & Fitness Program",
            category: "MARTIAL ARTS",
            image: "/images/adults_martial_arts.png",
            duration: "Active Enrollment",
            instructor: "Sensei Rahul Sharma",
            remainingClasses: 24,
            totalClasses: 24,
            status: "ACTIVE",
            expiryDate: "Active",
          },
        ]);
      }
    }
    loadPrograms();
  }, [searchParams]);

  const confirmDeleteProgram = async () => {
    if (!courseToDelete || !courseToDelete.isExpired) return;

    setIsDeleting(true);
    const res = await cancelStudentEnrollmentAction(courseToDelete.id);
    if (res.success) {
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            My Enrolled Programs
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage active belt tiers, track remaining classes, and clean up expired courses.
          </p>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="rounded-3xl p-8 sm:p-12 bg-[#14161D] border border-white/10 text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
                No Enrolled Programs Yet
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                You haven&apos;t enrolled in any martial arts belt tier or fitness program yet. Browse our courses and complete enrollment to unlock live classes.
              </p>
            </div>
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/25"
            >
              Browse Programs & Enroll Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enrolledCourses.map((course) => {
              const completedCount = course.totalClasses - course.remainingClasses;
              const progressPercent = Math.round((completedCount / course.totalClasses) * 100);
              const isExpired = course.status === "EXPIRED" || course.status === "COMPLETED" || course.remainingClasses <= 0 || course.daysRemaining <= 0;

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
                          course.status === "ACTIVE" && !isExpired
                            ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 backdrop-blur-md"
                            : "bg-[#E50914]/20 text-[#EF4444] border border-[#E50914]/30 backdrop-blur-md"
                        }`}
                      >
                        {isExpired ? "EXPIRED" : course.status}
                      </span>

                      {/* Top Right Delete / Active Lock Badge */}
                      {isExpired ? (
                        <button
                          type="button"
                          onClick={() => setCourseToDelete({ id: course.id, title: course.title, isExpired: true, remainingClasses: course.remainingClasses })}
                          title="Delete Expired Program"
                          className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#E50914]/30 hover:bg-[#E50914]/60 text-white border border-[#E50914]/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-md backdrop-blur-md active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white" />
                          Delete Expired
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCourseToDelete({ id: course.id, title: course.title, isExpired: false, remainingClasses: course.remainingClasses })}
                          title="Active Course - Cannot Delete"
                          className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 hover:bg-white/20 text-gray-300 border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-md backdrop-blur-md active:scale-95"
                        >
                          <Lock className="w-3.5 h-3.5 text-[#0080FF]" />
                          Active (Protected)
                        </button>
                      )}
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

                  <div className="p-6 pt-0 flex items-center gap-3">
                    {!isExpired ? (
                      <a
                        href="https://meet.google.com/selffits-live-class"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-grow py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-extrabold text-xs text-center hover:opacity-95 transition-all shadow-md shadow-[#10B981]/20 flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4 fill-current" />
                        JOIN LIVE CLASS NOW <ArrowRight className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="flex-grow py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-bold text-xs text-center block">
                        Course Validity Expired
                      </span>
                    )}

                    {isExpired ? (
                      <button
                        type="button"
                        onClick={() => setCourseToDelete({ id: course.id, title: course.title, isExpired: true, remainingClasses: course.remainingClasses })}
                        className="px-3.5 py-3 rounded-xl bg-[#E50914]/15 hover:bg-[#E50914]/30 text-[#EF4444] border border-[#E50914]/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                        title="Delete Expired Program"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCourseToDelete({ id: course.id, title: course.title, isExpired: false, remainingClasses: course.remainingClasses })}
                        className="px-3.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                        title="Active Course Protected"
                      >
                        <Lock className="w-4 h-4 text-[#0080FF]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* INTERACTIVE POPUP MODAL */}
        {courseToDelete && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#14161D] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {courseToDelete.isExpired ? (
                /* EXPIRED COURSE DELETE CONFIRMATION POPUP */
                <>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] shadow-lg shadow-[#E50914]/20">
                      <AlertTriangle className="w-7 h-7" />
                    </div>

                    <h3 className="text-xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
                      Delete Expired Program?
                    </h3>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      Are you sure you want to delete the expired program <span className="text-white font-bold">&quot;{courseToDelete.title}&quot;</span> from your dashboard history? This action is permanent.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCourseToDelete(null)}
                      disabled={isDeleting}
                      className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={confirmDeleteProgram}
                      disabled={isDeleting}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-xs hover:opacity-95 transition-all shadow-lg shadow-[#E50914]/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting ? "Deleting..." : "Yes, Delete Expired"}
                    </button>
                  </div>
                </>
              ) : (
                /* ACTIVE COURSE CANNOT DELETE POPUP WARNING */
                <>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#0080FF]/15 border border-[#0080FF]/30 flex items-center justify-center text-[#0080FF] shadow-lg shadow-[#0080FF]/20">
                      <Lock className="w-7 h-7" />
                    </div>

                    <h3 className="text-xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
                      Cannot Delete Active Program
                    </h3>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      Active ongoing programs cannot be deleted. <span className="text-white font-bold">&quot;{courseToDelete.title}&quot;</span> is currently active with <span className="text-[#10B981] font-bold">{courseToDelete.remainingClasses} classes remaining</span>.
                    </p>
                    <p className="text-[11px] text-gray-400 bg-white/5 border border-white/10 p-3 rounded-xl">
                      💡 Note: Only expired or completed programs can be deleted from your account.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setCourseToDelete(null)}
                      className="w-full py-3.5 rounded-xl bg-[#0080FF] hover:bg-[#0080FF]/90 text-white font-extrabold text-xs transition-all cursor-pointer shadow-lg shadow-[#0080FF]/25"
                    >
                      Got It
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </StudentShell>
  );
}
