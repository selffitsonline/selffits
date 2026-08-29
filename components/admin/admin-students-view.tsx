"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  Search,
  Filter,
  Users,
  UserCheck,
  UserMinus,
  UserX,
  Clock,
  Eye,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { StudentDetailsModal } from "@/components/admin/student-details-modal";
import { BlockStudentModal } from "@/components/admin/block-student-modal";
import { toggleBlockStudentAction } from "@/actions/admin.actions";

interface AdminStudentsViewProps {
  initialStudents: any[];
  initialCategories: string[];
  initialPrograms: { id: string; title: string; categoryLabel: string }[];
}

export function AdminStudentsView({
  initialStudents,
  initialCategories,
  initialPrograms,
}: AdminStudentsViewProps) {
  const [students, setStudents] = useState<any[]>(initialStudents || []);
  const [categories, setCategories] = useState<string[]>(initialCategories || []);
  const [programs, setPrograms] = useState<{ id: string; title: string; categoryLabel: string }[]>(
    initialPrograms || []
  );

  React.useEffect(() => {
    setStudents(initialStudents || []);
  }, [initialStudents]);

  React.useEffect(() => {
    setCategories(initialCategories || []);
  }, [initialCategories]);

  React.useEffect(() => {
    setPrograms(initialPrograms || []);
  }, [initialPrograms]);

  // Filter States
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "UNENROLLED" | "EXPIRED" | "BLOCKED">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedProgram, setSelectedProgram] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination / Page Indexing States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Modals
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<any | null>(null);
  const [selectedStudentForBlock, setSelectedStudentForBlock] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Handlers for state updates that reset current page to 1
  const handleTabChange = (tab: "ALL" | "ACTIVE" | "UNENROLLED" | "EXPIRED" | "BLOCKED") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleProgramChange = (prg: string) => {
    setSelectedProgram(prg);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  // Tab counts calculations
  const counts = {
    ALL: students.length,
    ACTIVE: students.filter((s) => !s.isBlocked && s.enrollmentStatus === "ACTIVE").length,
    UNENROLLED: students.filter((s) => !s.isBlocked && s.enrollmentStatus === "UNENROLLED").length,
    EXPIRED: students.filter((s) => !s.isBlocked && s.enrollmentStatus === "EXPIRED").length,
    BLOCKED: students.filter((s) => s.isBlocked).length,
  };

  // Filter logic combined
  const filteredStudents = students.filter((student) => {
    // Tab Filter
    if (activeTab === "ACTIVE" && (student.isBlocked || student.enrollmentStatus !== "ACTIVE")) return false;
    if (activeTab === "UNENROLLED" && (student.isBlocked || student.enrollmentStatus !== "UNENROLLED")) return false;
    if (activeTab === "EXPIRED" && (student.isBlocked || student.enrollmentStatus !== "EXPIRED")) return false;
    if (activeTab === "BLOCKED" && !student.isBlocked) return false;

    // Category Filter
    if (selectedCategory !== "ALL") {
      const matchesActiveCat = student.activeCategoryLabel === selectedCategory;
      const matchesAnyEnrollmentCat = student.enrollments?.some(
        (e: any) => e.categoryLabel === selectedCategory
      );
      if (!matchesActiveCat && !matchesAnyEnrollmentCat) return false;
    }

    // Program Filter
    if (selectedProgram !== "ALL") {
      const matchesActivePrg = student.activeProgram === selectedProgram;
      const matchesAnyEnrollmentPrg = student.enrollments?.some(
        (e: any) => e.programTitle === selectedProgram
      );
      if (!matchesActivePrg && !matchesAnyEnrollmentPrg) return false;
    }

    // Search Query Filter (Name, Email, Phone)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const matchName = student.name?.toLowerCase().includes(q);
      const matchEmail = student.email?.toLowerCase().includes(q);
      const matchPhone = student.phone?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }

    return true;
  });

  // Page Indexing Calculations
  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const handleToggleBlockConfirm = async (studentId: string, willBlock: boolean) => {
    const res = await toggleBlockStudentAction(studentId, willBlock);
    if (res.success) {
      setStudents((prev) =>
        prev.map((std) =>
          std.id === studentId
            ? {
                ...std,
                isBlocked: willBlock,
                accountStatus: willBlock ? "BLOCKED" : "ACTIVE",
              }
            : std
        )
      );

      // Also update currently open details modal if applicable
      if (selectedStudentForDetails?.id === studentId) {
        setSelectedStudentForDetails((prev: any) =>
          prev
            ? {
                ...prev,
                isBlocked: willBlock,
                accountStatus: willBlock ? "BLOCKED" : "ACTIVE",
              }
            : null
        );
      }

      setNotification({ message: res.message || "Student status updated.", type: "success" });
    } else {
      setNotification({ message: res.error || "Failed to update student status.", type: "error" });
    }

    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Notification Toast */}
        {notification && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition-all animate-in fade-in ${
              notification.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-xs hover:underline font-semibold">
              Dismiss
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Centralized Student Management Directory
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Database-backed student account controls, active course enrollments, class progress tracking, and payment histories.
            </p>
          </div>
        </div>

        {/* Status Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <button
            onClick={() => handleTabChange("ALL")}
            className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
              activeTab === "ALL"
                ? "bg-[#0080FF]/15 border-[#0080FF] text-white shadow-lg shadow-[#0080FF]/10"
                : "bg-[#14161D] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className={`w-4 h-4 ${activeTab === "ALL" ? "text-[#0080FF]" : "text-gray-500"}`} />
              <span className="text-xs font-bold">All Students</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-black">{counts.ALL}</span>
          </button>

          <button
            onClick={() => handleTabChange("ACTIVE")}
            className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
              activeTab === "ACTIVE"
                ? "bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                : "bg-[#14161D] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className={`w-4 h-4 ${activeTab === "ACTIVE" ? "text-emerald-400" : "text-gray-500"}`} />
              <span className="text-xs font-bold">Active Enrolled</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/30">
              {counts.ACTIVE}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("UNENROLLED")}
            className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
              activeTab === "UNENROLLED"
                ? "bg-blue-500/15 border-blue-500 text-white shadow-lg shadow-blue-500/10"
                : "bg-[#14161D] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserMinus className={`w-4 h-4 ${activeTab === "UNENROLLED" ? "text-blue-400" : "text-gray-500"}`} />
              <span className="text-xs font-bold">Unenrolled</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-black border border-blue-500/30">
              {counts.UNENROLLED}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("EXPIRED")}
            className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
              activeTab === "EXPIRED"
                ? "bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10"
                : "bg-[#14161D] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className={`w-4 h-4 ${activeTab === "EXPIRED" ? "text-amber-400" : "text-gray-500"}`} />
              <span className="text-xs font-bold">Expired</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black border border-amber-500/30">
              {counts.EXPIRED}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("BLOCKED")}
            className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
              activeTab === "BLOCKED"
                ? "bg-red-500/15 border-red-500 text-white shadow-lg shadow-red-500/10"
                : "bg-[#14161D] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserX className={`w-4 h-4 ${activeTab === "BLOCKED" ? "text-red-400" : "text-gray-500"}`} />
              <span className="text-xs font-bold">Blocked</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-black border border-red-500/30">
              {counts.BLOCKED}
            </span>
          </button>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="p-4 rounded-2xl bg-[#14161D] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Multi-field Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by student name, email address, or phone number..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF] transition-all"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          </div>

          {/* Dynamic Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Dynamic Category Filter */}
            <div className="flex items-center gap-2 bg-[#0F1117] border border-white/10 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#14161D]">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#14161D]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Program Title Filter */}
            <div className="flex items-center gap-2 bg-[#0F1117] border border-white/10 rounded-xl px-3 py-1.5">
              <select
                value={selectedProgram}
                onChange={(e) => handleProgramChange(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#14161D]">All Programs</option>
                {programs.map((prg) => (
                  <option key={prg.id} value={prg.title} className="bg-[#14161D]">
                    {prg.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Reset Button */}
            {(selectedCategory !== "ALL" || selectedProgram !== "ALL" || searchQuery !== "") && (
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedProgram("ALL");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F1117] text-gray-400 font-extrabold uppercase border-b border-white/10">
                <tr>
                  <th className="p-4">Student Profile</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4">Active Course & Category</th>
                  <th className="p-4">Class Progress</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Enrollment</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-500">
                      <Users className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
                      <p className="font-bold text-gray-400">No matching student records found.</p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Try adjusting your search criteria or category filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((std) => (
                    <tr
                      key={std.id}
                      className={`hover:bg-white/5 transition-colors cursor-pointer ${
                        std.isBlocked ? "bg-red-500/[0.02]" : ""
                      }`}
                      onClick={() => setSelectedStudentForDetails(std)}
                    >
                      {/* Student Profile Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                              std.isBlocked
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-gradient-to-br from-[#0080FF] to-[#0055B3] text-white"
                            }`}
                          >
                            {std.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm hover:text-[#0080FF] transition-colors">
                              {std.name}
                            </p>
                            <p className="text-gray-400 text-[11px]">{std.email}</p>
                            {std.phone && std.phone !== "Not provided" && (
                              <p className="text-gray-500 text-[10px]">{std.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="p-4 text-gray-300 font-medium">{std.joinedDate}</td>

                      {/* Active Course & Category */}
                      <td className="p-4">
                        {std.enrollmentStatus === "ACTIVE" ? (
                          <div className="space-y-1">
                            <p className="font-extrabold text-[#0080FF] text-xs leading-tight">
                              {std.activeProgram}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-black text-[10px]">
                                {std.activeCourseLevel}
                              </span>
                              <span className="text-gray-400 text-[10px]">
                                ({std.activeCategoryLabel})
                              </span>
                            </div>
                            {std.activeClassTiming && (
                              <p className="text-gray-300 text-[11px] flex items-center gap-1 font-semibold pt-0.5">
                                <Clock className="w-3.5 h-3.5 text-[#0080FF] shrink-0" />
                                {std.activeClassTiming}
                              </p>
                            )}
                          </div>
                        ) : std.enrollmentStatus === "EXPIRED" ? (
                          <div className="space-y-0.5">
                            <p className="font-bold text-amber-400 text-xs">{std.activeProgram}</p>
                            <p className="text-gray-500 text-[10px]">Expired Membership</p>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <p className="font-bold text-gray-400 text-xs">Unenrolled</p>
                            <p className="text-gray-500 text-[10px]">No active course</p>
                          </div>
                        )}
                      </td>

                      {/* Remaining / Completed Classes */}
                      <td className="p-4">
                        {std.enrollmentStatus === "ACTIVE" ? (
                          <div>
                            <p className="text-white font-extrabold">
                              {std.remainingClasses} / {std.totalClasses} Left
                            </p>
                            <p className="text-[10px] text-gray-400">{std.completedClasses} completed</p>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Total Spent */}
                      <td className="p-4 font-black text-emerald-400">{std.totalSpent}</td>

                      {/* Account Status Badge */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            std.isBlocked
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          {std.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      {/* Enrollment Status Badge */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            std.enrollmentStatus === "ACTIVE"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : std.enrollmentStatus === "EXPIRED"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : "bg-white/10 text-gray-400 border-white/10"
                          }`}
                        >
                          {std.enrollmentStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedStudentForDetails(std)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedStudentForBlock(std)}
                            className={`p-2 rounded-xl border transition-colors ${
                              std.isBlocked
                                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                            }`}
                            title={std.isBlocked ? "Unblock Account" : "Block Account"}
                          >
                            {std.isBlocked ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <ShieldAlert className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Page Indexing / Pagination Footer */}
          <div className="p-4 bg-[#0F1117] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-gray-400 font-medium">
              {totalItems > 0 ? (
                <>
                  Showing <span className="text-white font-bold">{startIndex + 1}</span> to{" "}
                  <span className="text-white font-bold">{endIndex}</span> of{" "}
                  <span className="text-[#0080FF] font-extrabold">{totalItems}</span> registered students
                </>
              ) : (
                "No student records to display"
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Items Per Page Selector */}
              <div className="flex items-center gap-2 text-gray-400">
                <span>Per Page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="bg-[#14161D] border border-white/10 rounded-lg px-2.5 py-1 text-white font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page Navigation Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-white/10 bg-[#14161D] text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - safeCurrentPage) <= 1
                    );
                  })
                  .map((page, idx, array) => {
                    const prevPage = array[idx - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="px-1 text-gray-500 font-bold">...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-extrabold transition-all ${
                            safeCurrentPage === page
                              ? "bg-[#0080FF] text-white shadow-md shadow-[#0080FF]/20"
                              : "bg-[#14161D] border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-white/10 bg-[#14161D] text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <StudentDetailsModal
          isOpen={!!selectedStudentForDetails}
          onClose={() => setSelectedStudentForDetails(null)}
          student={selectedStudentForDetails}
          onOpenBlockModal={(std) => {
            setSelectedStudentForBlock(std);
          }}
        />

        <BlockStudentModal
          isOpen={!!selectedStudentForBlock}
          onClose={() => setSelectedStudentForBlock(null)}
          student={selectedStudentForBlock}
          onConfirm={handleToggleBlockConfirm}
        />
      </div>
    </AdminShell>
  );
}
