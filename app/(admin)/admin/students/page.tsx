"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Search, Filter, Edit3, UserCheck, ShieldAlert, Plus } from "lucide-react";

export default function AdminStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editModalStudent, setEditModalStudent] = useState<any | null>(null);

  const [students, setStudents] = useState([
    {
      id: "std-1",
      name: "Demo Student",
      email: "student@selffits.com",
      phone: "+91 98765 43210",
      country: "India",
      program: "Adults Martial Arts",
      belt: "Blue Belt",
      remainingClasses: 18,
      totalClasses: 24,
      status: "ACTIVE",
    },
    {
      id: "std-2",
      name: "Arjun Nair",
      email: "arjun@example.com",
      phone: "+91 91234 56789",
      country: "India",
      program: "Kids Martial Arts",
      belt: "Yellow Belt",
      remainingClasses: 6,
      totalClasses: 8,
      status: "ACTIVE",
    },
    {
      id: "std-3",
      name: "Sarah Jenkins",
      email: "sarah.j@example.com",
      phone: "+1 555-0199",
      country: "United States",
      program: "Ladies Only HIIT",
      belt: "Transformation",
      remainingClasses: 20,
      totalClasses: 24,
      status: "ACTIVE",
    },
  ]);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateClasses = (newCount: number) => {
    if (!editModalStudent) return;
    setStudents(
      students.map((s) => (s.id === editModalStudent.id ? { ...s, remainingClasses: newCount } : s))
    );
    setEditModalStudent(null);
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Student Directory Management
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              View student profiles, adjust class balances, and manage active enrollments.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#14161D] p-4 rounded-2xl border border-white/10">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by name, email, or program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#0080FF]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>

          <div className="text-xs text-gray-400 font-semibold">
            Showing {filteredStudents.length} Students
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0F1117] text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Email / Phone</th>
                  <th className="p-4">Program</th>
                  <th className="p-4">Belt Rank</th>
                  <th className="p-4">Classes Left</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-white/5">
                    <td className="p-4 font-bold text-white">{std.name}</td>
                    <td className="p-4 space-y-0.5">
                      <p className="text-gray-200">{std.email}</p>
                      <p className="text-[10px] text-gray-500">{std.phone} • {std.country}</p>
                    </td>
                    <td className="p-4">{std.program}</td>
                    <td className="p-4 font-semibold text-[#0080FF]">{std.belt}</td>
                    <td className="p-4 font-bold text-white">
                      {std.remainingClasses} / {std.totalClasses}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded bg-[#10B981]/20 text-[#10B981] font-bold text-[10px]">
                        {std.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setEditModalStudent(std)}
                        className="px-3 py-1.5 rounded-lg bg-[#0080FF]/15 text-[#0080FF] hover:bg-[#0080FF] hover:text-white transition-colors text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Adjust Balance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Adjust Class Modal */}
        {editModalStudent && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#14161D] border border-white/15 rounded-2xl p-6 max-w-md w-full space-y-4">
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                Adjust Remaining Classes
              </h3>
              <p className="text-xs text-gray-400">
                Modifying class balance for <span className="text-white font-bold">{editModalStudent.name}</span>.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-300 mb-1">
                  Remaining Classes Count
                </label>
                <input
                  type="number"
                  defaultValue={editModalStudent.remainingClasses}
                  id="newClassInput"
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white text-sm focus:outline-none focus:border-[#0080FF]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setEditModalStudent(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const inputEl = document.getElementById("newClassInput") as HTMLInputElement;
                    handleUpdateClasses(parseInt(inputEl.value || "0"));
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#0080FF] text-white font-bold text-xs shadow-md shadow-[#0080FF]/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
