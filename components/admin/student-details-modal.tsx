"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  CreditCard,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

interface EnrollmentItem {
  id: string;
  programTitle: string;
  programCategory: string;
  categoryLabel: string;
  membershipPlanName: string;
  courseLevel?: string;
  joinedTimestamp?: string;
  startDate: string;
  endDate: string;
  totalClassesGranted: number;
  remainingClasses: number;
  completedClasses: number;
  status: string;
}

interface PaymentItem {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  formattedAmount: string;
  status: string;
  date: string;
}

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    age?: string;
    gender?: string;
    emergencyContact: string;
    isBlocked: boolean;
    accountStatus: string;
    enrollmentStatus: string;
    joinedDate: string;
    activeProgram: string;
    activeCategoryLabel: string;
    activeCourseLevel?: string;
    activeClassTiming?: string;
    activeEnrollmentFullTimestamp?: string | null;
    totalEnrollments: number;
    remainingClasses: number;
    totalClasses: number;
    completedClasses: number;
    expiryDate: string | null;
    totalSpent: string;
    totalSpentNum: number;
    enrollments: EnrollmentItem[];
    payments: PaymentItem[];
  } | null;
  onOpenBlockModal: (student: any) => void;
}

export function StudentDetailsModal({
  isOpen,
  onClose,
  student,
  onOpenBlockModal,
}: StudentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "enrollments" | "payments">("overview");

  if (!isOpen || !student) return null;

  const activeProgressPercent =
    student.totalClasses > 0
      ? Math.min(100, Math.round((student.completedClasses / student.totalClasses) * 100))
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#14161D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 bg-[#0F1117] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0080FF] to-[#0055B3] flex items-center justify-center font-extrabold text-white text-xl shadow-lg shrink-0">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-white font-[family-name:var(--font-outfit)]">
                  {student.name}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                    student.isBlocked
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {student.isBlocked ? "Account Blocked" : "Account Active"}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                    student.enrollmentStatus === "ACTIVE"
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      : student.enrollmentStatus === "EXPIRED"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-white/10 text-gray-400 border-white/10"
                  }`}
                >
                  {student.enrollmentStatus === "ACTIVE"
                    ? "Enrolled"
                    : student.enrollmentStatus === "EXPIRED"
                    ? "Expired"
                    : "Unenrolled"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                  {student.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-500" />
                  {student.phone}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => onOpenBlockModal(student)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                student.isBlocked
                  ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                  : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
              }`}
            >
              {student.isBlocked ? (
                <>
                  <ShieldCheck className="w-4 h-4" /> Unblock Student
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" /> Block Student
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-white/10 bg-[#0F1117]/50 flex items-center gap-6 text-xs font-bold text-gray-400">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-[#0080FF] text-white"
                : "border-transparent hover:text-gray-200"
            }`}
          >
            <User className="w-4 h-4" /> Overview & Active Course
          </button>
          <button
            onClick={() => setActiveTab("enrollments")}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "enrollments"
                ? "border-[#0080FF] text-white"
                : "border-transparent hover:text-gray-200"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Enrollments History ({student.enrollments.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "payments"
                ? "border-[#0080FF] text-white"
                : "border-transparent hover:text-gray-200"
            }`}
          >
            <CreditCard className="w-4 h-4" /> Payment History ({student.payments.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Active Program Progress Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0F1117] to-[#141824] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#0080FF] tracking-wider">
                      Current Active Program
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-0.5">
                      {student.activeProgram}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {student.activeCourseLevel && (
                        <span className="px-2.5 py-0.5 rounded-md bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-black text-xs">
                          {student.activeCourseLevel}
                        </span>
                      )}
                      <span className="text-gray-400 text-xs font-medium">
                        Category: {student.activeCategoryLabel}
                      </span>
                    </div>
                    {student.activeClassTiming && (
                      <div className="mt-2 space-y-1">
                        <p className="text-gray-300 text-xs flex items-center gap-1.5 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-[#0080FF]" />
                          Selected Schedule: {(student as any).activeSelectedDays?.join(", ") || "Sunday, Wednesday, Saturday"} ({(student as any).activeDaysPerWeek || 3} Days/Wk)
                        </p>
                        <p className="text-gray-300 text-xs flex items-center gap-1.5 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                          Session Batch Timing: {(student as any).activeSelectedBatch || student.activeClassTiming}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-gray-400">Total Spent</span>
                    <p className="text-lg font-black text-emerald-400">{student.totalSpent}</p>
                  </div>
                </div>

                {student.enrollmentStatus === "ACTIVE" ? (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-300">
                        Class Progress ({student.completedClasses} completed / {student.remainingClasses} remaining)
                      </span>
                      <span className="text-[#0080FF] font-bold">{activeProgressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0080FF] to-[#10B981] transition-all duration-500"
                        style={{ width: `${activeProgressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        Expiry Date: {student.expiryDate}
                      </span>
                      <span>Total Granted: {student.totalClasses} Classes</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/5 text-gray-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {student.enrollmentStatus === "EXPIRED"
                        ? "This student's course enrollment has expired. They can renew through the student portal."
                        : "No active course enrollment recorded for this student."}
                    </span>
                  </div>
                )}
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#0F1117] border border-white/5 space-y-1">
                  <p className="text-gray-400 text-[11px]">Phone Number</p>
                  <p className="text-white font-bold">{student.phone}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#0F1117] border border-white/5 space-y-1">
                  <p className="text-gray-400 text-[11px]">Location</p>
                  <p className="text-white font-bold">
                    {student.country}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#0F1117] border border-white/5 space-y-1">
                  <p className="text-gray-400 text-[11px]">Age & Gender</p>
                  <p className="text-white font-bold">
                    {student.age || "N/A"} • {student.gender || "N/A"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#0F1117] border border-white/5 space-y-1">
                  <p className="text-gray-400 text-[11px]">Registration Date</p>
                  <p className="text-white font-bold">{student.joinedDate}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#0F1117] border border-white/5 space-y-1">
                  <p className="text-gray-400 text-[11px]">Emergency Contact</p>
                  <p className="text-white font-bold">{student.emergencyContact}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#0F1117] border border-white/5 space-y-1">
                  <p className="text-gray-400 text-[11px]">Total Enrollments</p>
                  <p className="text-white font-bold">{student.totalEnrollments} Courses</p>
                </div>
                <div className="p-4 rounded-xl bg-[#0F1117] border border-white/5 space-y-1">
                  <p className="text-gray-400 text-[11px]">Account Status</p>
                  <p
                    className={`font-bold ${
                      student.isBlocked ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {student.isBlocked ? "Blocked" : "Active & Clear"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "enrollments" && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white font-[family-name:var(--font-outfit)]">
                Course Enrollment History
              </h4>

              {student.enrollments.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-[#0F1117] rounded-xl border border-white/5">
                  No program enrollments recorded for this student.
                </div>
              ) : (
                <div className="bg-[#0F1117] border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0A0C10] text-gray-400 font-extrabold uppercase border-b border-white/10">
                      <tr>
                        <th className="p-3">Program & Category</th>
                        <th className="p-3">Plan Tier</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Classes Progress</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {student.enrollments.map((e) => (
                        <tr key={e.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3">
                            <p className="font-bold text-white">{e.programTitle}</p>
                            <p className="text-[#10B981] font-semibold text-[11px]">{e.courseLevel || e.membershipPlanName}</p>
                            {e.joinedTimestamp && (
                              <p className="text-gray-400 text-[10px] flex items-center gap-1 mt-0.5 font-medium">
                                <Clock className="w-3 h-3 text-gray-500 shrink-0" />
                                {e.joinedTimestamp}
                              </p>
                            )}
                          </td>
                          <td className="p-3 text-gray-300 font-semibold">{e.membershipPlanName}</td>
                          <td className="p-3 text-gray-400 text-[11px]">
                            {e.startDate} - {e.endDate}
                          </td>
                          <td className="p-3 text-gray-300 font-bold">
                            {e.remainingClasses} left / {e.totalClassesGranted} total
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                e.status === "ACTIVE"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-white/10 text-gray-400"
                              }`}
                            >
                              {e.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-[family-name:var(--font-outfit)]">
                  Payment Transactions
                </h4>
                <p className="text-xs text-gray-400">
                  Total Payments: <span className="text-emerald-400 font-bold">{student.totalSpent}</span>
                </p>
              </div>

              {student.payments.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-[#0F1117] rounded-xl border border-white/5">
                  No payment transactions recorded for this student.
                </div>
              ) : (
                <div className="bg-[#0F1117] border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0A0C10] text-gray-400 font-extrabold uppercase border-b border-white/10">
                      <tr>
                        <th className="p-3">Razorpay Order ID</th>
                        <th className="p-3">Payment ID</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {student.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-mono text-gray-300">{p.razorpayOrderId}</td>
                          <td className="p-3 font-mono text-gray-400 text-[11px]">{p.razorpayPaymentId}</td>
                          <td className="p-3 text-gray-400">{p.date}</td>
                          <td className="p-3 font-bold text-emerald-400">{p.formattedAmount}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                p.status === "SUCCESS"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
