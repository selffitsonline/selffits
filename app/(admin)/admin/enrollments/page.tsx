"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { UserPlus, Trash2, Check, UserCheck, ShieldCheck } from "lucide-react";

export default function AdminEnrollmentsPage() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [enrollments, setEnrollments] = useState([
    {
      id: "enr-1",
      studentName: "Demo Student",
      studentEmail: "student@selffits.com",
      programName: "Adults Martial Arts - Blue Belt Tier",
      startDate: "Aug 1, 2026",
      endDate: "Oct 15, 2026",
      remainingClasses: 18,
      status: "ACTIVE",
    },
  ]);

  const [formData, setFormData] = useState({
    studentEmail: "student@selffits.com",
    programName: "Adults Martial Arts - Blue Belt Tier",
    grantedClasses: 24,
  });

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    const newEnr = {
      id: `enr-${Date.now()}`,
      studentName: "Enrolled Student",
      studentEmail: formData.studentEmail,
      programName: formData.programName,
      startDate: "Today",
      endDate: "3 Months Later",
      remainingClasses: formData.grantedClasses,
      status: "ACTIVE",
    };
    setEnrollments([newEnr, ...enrollments]);
    setSuccessMsg(`Enrolled ${formData.studentEmail} in "${formData.programName}"!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleRemove = (id: string) => {
    setEnrollments(enrollments.filter((e) => e.id !== id));
    setSuccessMsg("Enrollment removed successfully.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <AdminShell>
      <div className="space-y-8 max-w-5xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Enrollment Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manual student program assignment, subscription provisioning, and cancellation tools.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Enroll Form */}
        <div className="bg-[#14161D] border border-white/10 p-8 rounded-3xl space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <UserPlus className="w-5 h-5 text-[#0080FF]" />
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
              Manual Student Enrollment
            </h2>
          </div>

          <form onSubmit={handleEnroll} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Student Email
                </label>
                <input
                  type="email"
                  value={formData.studentEmail}
                  onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Program & Belt Tier
                </label>
                <select
                  value={formData.programName}
                  onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs"
                >
                  <option value="Kids Martial Arts - Yellow Belt">Kids Martial Arts - Yellow Belt</option>
                  <option value="Adults Martial Arts - Blue Belt Tier">Adults Martial Arts - Blue Belt Tier</option>
                  <option value="Ladies Only HIIT Program">Ladies Only HIIT Program</option>
                  <option value="24 Day Weight Loss Challenge">24 Day Weight Loss Challenge</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0080FF] text-white font-bold text-xs hover:opacity-95 transition-opacity shadow-md shadow-[#0080FF]/20 flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Provision Student Enrollment
            </button>
          </form>
        </div>

        {/* Enrollment Roster */}
        <div className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden p-6 space-y-4">
          <h3 className="text-base font-bold text-white font-[family-name:var(--font-outfit)]">
            Active Enrollments List ({enrollments.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0F1117] text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Program</th>
                  <th className="p-3">Classes Left</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {enrollments.map((enr) => (
                  <tr key={enr.id}>
                    <td className="p-3 font-bold text-white">{enr.studentEmail}</td>
                    <td className="p-3">{enr.programName}</td>
                    <td className="p-3 font-bold text-[#10B981]">{enr.remainingClasses} Left</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-bold text-[10px]">
                        {enr.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRemove(enr.id)}
                        className="px-3 py-1 rounded bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-colors text-xs font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
