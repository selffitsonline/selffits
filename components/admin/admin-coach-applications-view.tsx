"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Award,
  Users,
  Clock,
} from "lucide-react";
import { updateCoachApplicationStatusAction } from "@/actions/admin.actions";
import { clearAdminCacheKey } from "@/lib/admin-cache";

interface AdminCoachApplicationsViewProps {
  initialApplications: any[];
}

const DISCIPLINE_CATEGORIES = [
  "Karate",
  "Kung Fu",
  "Taekwondo",
  "Kickboxing",
  "Yoga",
  "Fitness / Functional Training",
];

export function AdminCoachApplicationsView({ initialApplications }: AdminCoachApplicationsViewProps) {
  const [applications, setApplications] = useState<any[]>(initialApplications || []);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter States
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "REJECTED">("ALL");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination / Page Indexing States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Handlers for state updates that reset current page to 1
  const handleTabChange = (tab: "ALL" | "PENDING" | "REJECTED") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleDisciplineChange = (disc: string) => {
    setSelectedDiscipline(disc);
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

  // Status Approval / Rejection Action
  const handleStatusUpdate = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    setMsg(null);
    const res = await updateCoachApplicationStatusAction(id, newStatus);
    if (res.success) {
      clearAdminCacheKey("admin_coach_apps");
      clearAdminCacheKey("admin_coaches");
      clearAdminCacheKey("admin_dashboard_stats");

      if (newStatus === "APPROVED") {
        // Once APPROVED, immediately remove from the application/leads list
        setApplications((prev) => prev.filter((item) => item.id !== id));
        setMsg({
          type: "success",
          text: "Coach application approved! Candidate has been moved to the Active Coaches directory.",
        });
      } else {
        // For REJECTED, update local status
        setApplications((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        setMsg({ type: "success", text: "Application status set to Rejected." });
      }
    } else {
      setMsg({ type: "error", text: res.error || "Failed to update application status." });
    }

    setTimeout(() => setMsg(null), 5000);
  };

  // Counts calculations
  const counts = {
    ALL: applications.length,
    PENDING: applications.filter((app) => app.status === "PENDING").length,
    REJECTED: applications.filter((app) => app.status === "REJECTED").length,
  };

  // Filter Logic Combined
  const filteredApplications = applications.filter((app) => {
    // Tab Status Filter
    if (activeTab === "PENDING" && app.status !== "PENDING") return false;
    if (activeTab === "REJECTED" && app.status !== "REJECTED") return false;

    // Discipline Category Filter
    if (selectedDiscipline !== "ALL") {
      const rawDisc: string[] = app.rawDisciplines || [];
      const discString: string = app.disciplines || "";
      const matchesRaw = rawDisc.some(
        (d) => d.toLowerCase().includes(selectedDiscipline.toLowerCase())
      );
      const matchesString = discString.toLowerCase().includes(selectedDiscipline.toLowerCase());
      if (!matchesRaw && !matchesString) return false;
    }

    // Search Query Filter (Name, Email, Phone, Rank, Discipline)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const matchName = app.fullName?.toLowerCase().includes(q);
      const matchEmail = app.email?.toLowerCase().includes(q);
      const matchPhone = app.phone?.toLowerCase().includes(q);
      const matchRank = app.highestRank?.toLowerCase().includes(q);
      const matchDisc = app.disciplines?.toLowerCase().includes(q);

      if (!matchName && !matchEmail && !matchPhone && !matchRank && !matchDisc) return false;
    }

    return true;
  });

  // Page Indexing Calculations
  const totalItems = filteredApplications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Coach Applications & Registration Leads
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Review submitted coach applications, filter by coaching disciplines, download resumes, and manage approvals.
            </p>
          </div>
        </div>

        {/* Notification Alert Toast */}
        {msg && (
          <div
            className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between transition-all animate-in fade-in ${
              msg.type === "success"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/15 text-red-400 border border-red-500/30"
            }`}
          >
            <div className="flex items-center gap-2">
              {msg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{msg.text}</span>
            </div>
            <button onClick={() => setMsg(null)} className="hover:underline text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* Status Category Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <span className="text-xs font-bold">All Active Applications</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-black">{counts.ALL}</span>
          </button>

          <button
            onClick={() => handleTabChange("PENDING")}
            className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
              activeTab === "PENDING"
                ? "bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10"
                : "bg-[#14161D] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className={`w-4 h-4 ${activeTab === "PENDING" ? "text-amber-400" : "text-gray-500"}`} />
              <span className="text-xs font-bold">Pending Review</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black border border-amber-500/30">
              {counts.PENDING}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("REJECTED")}
            className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
              activeTab === "REJECTED"
                ? "bg-red-500/15 border-red-500 text-white shadow-lg shadow-red-500/10"
                : "bg-[#14161D] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <XCircle className={`w-4 h-4 ${activeTab === "REJECTED" ? "text-red-400" : "text-gray-500"}`} />
              <span className="text-xs font-bold">Rejected Applications</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-black border border-red-500/30">
              {counts.REJECTED}
            </span>
          </button>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="p-4 rounded-2xl bg-[#14161D] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search candidate by name, email, phone, rank, or discipline..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF] transition-all"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          </div>

          {/* Discipline Category Dropdown Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0F1117] border border-white/10 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <select
                value={selectedDiscipline}
                onChange={(e) => handleDisciplineChange(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#14161D]">
                  All Disciplines
                </option>
                {DISCIPLINE_CATEGORIES.map((disc) => (
                  <option key={disc} value={disc} className="bg-[#14161D]">
                    {disc}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(selectedDiscipline !== "ALL" || searchQuery !== "") && (
              <button
                onClick={() => {
                  setSelectedDiscipline("ALL");
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

        {/* Coach Application Cards List */}
        {paginatedApplications.length === 0 ? (
          <div className="rounded-3xl p-12 bg-[#14161D] border border-white/10 text-center space-y-3 max-w-md mx-auto shadow-xl">
            <FileText className="w-10 h-10 text-gray-600 mx-auto opacity-60" />
            <h3 className="text-base font-bold text-white">No Matching Applications Found</h3>
            <p className="text-xs text-gray-400">
              {applications.length === 0
                ? "All coach applications have been processed or approved into the Active Coaches directory."
                : "No application matches your current search or discipline filter criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedApplications.map((app) => (
              <div
                key={app.id}
                className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 transition-all"
              >
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)]">
                      {app.fullName}
                    </h3>
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        app.status === "APPROVED"
                          ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                          : app.status === "REJECTED"
                          ? "bg-[#E50914]/20 text-[#EF4444] border border-[#E50914]/30"
                          : "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-300">
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#0080FF]" /> {app.email}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#10B981]" /> Phone/WhatsApp: {app.phone}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> Applied: {app.appliedDate}
                    </p>
                  </div>

                  <div className="text-xs text-gray-400 space-y-1">
                    <p className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-bold text-gray-200">Disciplines:</span>{" "}
                      <span className="text-[#0080FF] font-semibold">{app.disciplines}</span>
                    </p>
                    <p className="pl-5 text-gray-400">
                      <span className="font-semibold text-gray-300">Rank & Experience:</span> {app.highestRank} ({app.totalExperience} Exp)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                  {app.resumeUrl ? (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0080FF]" /> Download Resume
                    </a>
                  ) : (
                    <span className="px-3 py-2 rounded-xl bg-white/5 text-gray-500 text-xs font-medium">
                      No Resume Uploaded
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(app.id, "APPROVED")}
                    className="px-3.5 py-2 rounded-xl bg-[#10B981]/20 hover:bg-[#10B981]/40 text-[#10B981] border border-[#10B981]/30 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-lg shadow-[#10B981]/10"
                    title="Approve and move to Active Coaches"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>

                  {app.status !== "REJECTED" && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                      className="px-3.5 py-2 rounded-xl bg-[#E50914]/20 hover:bg-[#E50914]/40 text-[#EF4444] border border-[#E50914]/30 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Page Indexing / Pagination Bar */}
            <div className="p-4 rounded-2xl bg-[#14161D] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="text-gray-400 font-medium">
                {totalItems > 0 ? (
                  <>
                    Showing <span className="text-white font-bold">{startIndex + 1}</span> to{" "}
                    <span className="text-white font-bold">{endIndex}</span> of{" "}
                    <span className="text-[#0080FF] font-extrabold">{totalItems}</span> applications
                  </>
                ) : (
                  "No applications display"
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Per Page Selector */}
                <div className="flex items-center gap-2 text-gray-400">
                  <span>Per Page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="bg-[#0F1117] border border-white/10 rounded-lg px-2.5 py-1 text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={safeCurrentPage === 1}
                    className="p-1.5 rounded-lg border border-white/10 bg-[#0F1117] text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
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
                                : "bg-[#0F1117] border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
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
                    className="p-1.5 rounded-lg border border-white/10 bg-[#0F1117] text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
