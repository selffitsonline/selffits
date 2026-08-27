"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTableSkeleton } from "@/components/admin/admin-skeletons";
import { Search } from "lucide-react";
import { getAdminStudentsAction } from "@/actions/admin.actions";
import { fetchAdminDataWithCache } from "@/lib/admin-cache";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStudents() {
      try {
        const res = await fetchAdminDataWithCache("admin_students", getAdminStudentsAction);
        if (isMounted && res && res.success && res.students) {
          setStudents(res.students);
        }
      } catch (err) {
        console.error("Admin students load error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadStudents();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <AdminTableSkeleton title="Registered Student Accounts" />;
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Registered Student Accounts Directory
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              View student registration profiles, active program memberships, class progress, and payment totals.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search student by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#14161D] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>

        <div className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F1117] text-gray-400 font-extrabold uppercase border-b border-white/10">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4">Active Program</th>
                  <th className="p-4">Remaining Classes</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!isLoading && filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No matching student registrations found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std) => (
                    <tr key={std.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-white text-sm">{std.name}</p>
                        <p className="text-gray-400 text-[11px]">{std.email}</p>
                      </td>
                      <td className="p-4 text-gray-300">{std.joinedDate}</td>
                      <td className="p-4 font-semibold text-[#0080FF]">{std.activeProgram}</td>
                      <td className="p-4 text-gray-300 font-bold">
                        {std.remainingClasses} / {std.totalClasses}
                      </td>
                      <td className="p-4 font-extrabold text-[#10B981]">{std.totalSpent}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            std.status === "ACTIVE"
                              ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                              : "bg-white/10 text-gray-400"
                          }`}
                        >
                          {std.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
