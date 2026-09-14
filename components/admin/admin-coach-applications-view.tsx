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
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Award,
  Users,
  Clock,
  Eye,
  X,
  ShieldCheck,
  MapPin,
  User,
  Upload,
  Briefcase,
  Globe,
} from "lucide-react";
import { updateCoachApplicationStatusAction } from "@/actions/admin.actions";
import { clearAdminCacheKey } from "@/lib/admin-cache";

interface AdminCoachApplicationsViewProps {
  initialApplications: any[];
}

export function AdminCoachApplicationsView({ initialApplications }: AdminCoachApplicationsViewProps) {
  const [applications, setApplications] = useState<any[]>(initialApplications || []);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Selected Application for Detail Modal
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  // Filter States
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "REJECTED">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination / Page Indexing States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Handlers for state updates that reset current page to 1
  const handleTabChange = (tab: "ALL" | "PENDING" | "REJECTED") => {
    setActiveTab(tab);
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

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [downloadingResumeId, setDownloadingResumeId] = useState<string | null>(null);

  // Authenticated Resume Download via Fetch -> Blob -> Temporary Object URL
  const handleDownloadResume = async (appId: string, candidateName?: string) => {
    if (downloadingResumeId) return;
    setDownloadingResumeId(appId);
    try {
      const res = await fetch(`/api/coach-application/resume/${appId}`, {
        method: "GET",
        headers: {
          "Accept": "application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/*, */*",
        },
      });

      if (!res.ok) {
        let errText = "Failed to download resume file.";
        try {
          const json = await res.json();
          if (json.error) errText = json.error;
        } catch {}
        setMsg({ type: "error", text: errText });
        return;
      }

      const disposition = res.headers.get("Content-Disposition");
      let filename = `Resume_${(candidateName || "Coach").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const blob = await res.blob();
      if (!blob || blob.size === 0) {
        setMsg({ type: "error", text: "Resume file content is empty or corrupted." });
        return;
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 10000);
    } catch (err: any) {
      console.error("Resume download error:", err);
      setMsg({ type: "error", text: "Network error downloading resume file." });
    } finally {
      setDownloadingResumeId(null);
    }
  };

  // Status Approval / Rejection Action
  const handleStatusUpdate = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    if (processingId) return;
    setProcessingId(id);
    setMsg(null);
    try {
      const res = await updateCoachApplicationStatusAction(id, newStatus);
      if (res.success) {
        clearAdminCacheKey("admin_coach_apps");
        clearAdminCacheKey("admin_coaches");
        clearAdminCacheKey("admin_dashboard_stats");

        setApplications((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedApp?.id === id) {
          setSelectedApp((prev: any) => (prev ? { ...prev, status: newStatus } : null));
        }

        setMsg({
          type: "success",
          text:
            newStatus === "APPROVED"
              ? "Coach application approved! Candidate has been promoted to Active Coaches."
              : "Application status updated to Rejected.",
        });
      } else {
        setMsg({ type: "error", text: res.error || "Failed to update application status." });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: "An error occurred while updating status." });
    } finally {
      setProcessingId(null);
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

    // Search Query Filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const matchName = app.fullName?.toLowerCase().includes(q);
      const matchEmail = app.email?.toLowerCase().includes(q);
      const matchPhone = app.phone?.toLowerCase().includes(q);
      const matchBelt = (app.beltLevel || app.highestRank)?.toLowerCase().includes(q);
      const matchExp = (app.yearsOfExperience || app.totalExperience)?.toLowerCase().includes(q);
      const matchLocation = app.location?.toLowerCase().includes(q);
      const matchNationality = app.nationality?.toLowerCase().includes(q);

      if (
        !matchName &&
        !matchEmail &&
        !matchPhone &&
        !matchBelt &&
        !matchExp &&
        !matchLocation &&
        !matchNationality
      )
        return false;
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
              Coach Leads & Resumes
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Review submitted coach applications, inspect candidate details, download resumes, and manage approvals.
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
              <span className="text-xs font-bold">All Submissions</span>
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
              placeholder="Search candidate by name, email, phone, belt level, location, or nationality..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF] transition-all"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          </div>

          {searchQuery !== "" && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start md:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear Search
            </button>
          )}
        </div>

        {/* Coach Lead Cards List */}
        {paginatedApplications.length === 0 ? (
          <div className="rounded-3xl p-12 bg-[#14161D] border border-white/10 text-center space-y-3 max-w-md mx-auto shadow-xl">
            <FileText className="w-10 h-10 text-gray-600 mx-auto opacity-60" />
            <h3 className="text-base font-bold text-white">No Coach Applications Found</h3>
            <p className="text-xs text-gray-400">
              {applications.length === 0
                ? "No applications have been submitted yet."
                : "No application matches your current search criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedApplications.map((app) => (
              <div
                key={app.id}
                className="bg-[#14161D] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 transition-all"
              >
                <div className="space-y-3 flex-grow">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E50914] to-[#B30006] flex items-center justify-center text-white font-black text-base shadow-md shrink-0">
                      {app.fullName?.charAt(0) || "C"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
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
                      <p className="text-[11px] text-gray-400 flex items-center gap-3 flex-wrap mt-0.5">
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <MapPin className="w-3 h-3" /> Location: {app.location || "N/A"}
                        </span>
                        <span>• Nationality: <strong className="text-gray-200">{app.nationality || "N/A"}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-300">
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-[#0080FF] shrink-0" /> <span className="truncate">{app.email}</span>
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-[#10B981] shrink-0" /> <span className="truncate">Phone: {app.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-gray-400">
                      <Calendar className="w-3.5 h-3.5 shrink-0" /> Applied: {app.appliedDate}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <p className="flex items-center gap-2 bg-[#0F1117] px-3 py-1.5 rounded-xl border border-white/5">
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-gray-400 font-semibold">Belt Level:</span>
                      <span className="text-white font-extrabold">{app.beltLevel || app.highestRank}</span>
                    </p>

                    <p className="flex items-center gap-2 bg-[#0F1117] px-3 py-1.5 rounded-xl border border-white/5">
                      <Briefcase className="w-3.5 h-3.5 text-[#0080FF] shrink-0" />
                      <span className="text-gray-400 font-semibold">Experience:</span>
                      <span className="text-white font-extrabold">{app.yearsOfExperience || app.totalExperience}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(app)}
                    className="px-3.5 py-2 rounded-xl bg-[#0080FF]/20 hover:bg-[#0080FF]/35 text-[#0080FF] border border-[#0080FF]/30 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md shadow-[#0080FF]/10"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </button>

                  {app.resumeUrl ? (
                    <button
                      type="button"
                      disabled={downloadingResumeId === app.id}
                      onClick={() => handleDownloadResume(app.id, app.fullName)}
                      className="px-3.5 py-2 rounded-xl bg-[#10B981]/20 hover:bg-[#10B981]/35 disabled:opacity-50 text-[#10B981] border border-[#10B981]/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {downloadingResumeId === app.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#10B981]" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-[#10B981]" />
                      )}
                      Resume
                    </button>
                  ) : null}

                  <button
                    type="button"
                    disabled={processingId === app.id}
                    onClick={() => handleStatusUpdate(app.id, "APPROVED")}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/20"
                    title="Approve and move to Active Coaches"
                  >
                    {processingId === app.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    {app.status === "APPROVED" ? "Approved" : "Approve"}
                  </button>

                  {app.status !== "REJECTED" && (
                    <button
                      type="button"
                      disabled={processingId === app.id}
                      onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                      className="px-3.5 py-2 rounded-xl bg-[#E50914]/20 hover:bg-[#E50914]/40 disabled:opacity-50 disabled:pointer-events-none text-[#EF4444] border border-[#E50914]/30 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {processingId === app.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      Reject
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

        {/* FULL CANDIDATE APPLICATION DETAILS MODAL */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-[#14161D] border border-white/15 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 bg-[#0F1117] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E50914] to-[#B30006] flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                    {selectedApp.fullName?.charAt(0) || "C"}
                  </div>

                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-black text-white font-[family-name:var(--font-outfit)]">
                        {selectedApp.fullName}
                      </h2>
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          selectedApp.status === "APPROVED"
                            ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                            : selectedApp.status === "REJECTED"
                            ? "bg-[#E50914]/20 text-[#EF4444] border border-[#E50914]/30"
                            : "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                        }`}
                      >
                        {selectedApp.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-3 flex-wrap">
                      <span>Applied: <strong className="text-white">{selectedApp.appliedDate}</strong></span>
                      {selectedApp.location && (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <MapPin className="w-3.5 h-3.5" /> Location: {selectedApp.location}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-all cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: ALL 14 FIELDS */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-gray-300">
                
                {/* 1. Personal Identification */}
                <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-2">
                    <User className="w-4 h-4 text-[#0080FF]" /> 1. Personal Identification
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Full Name</span>
                      <span className="text-white font-extrabold text-sm">{selectedApp.fullName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Date of Birth</span>
                      <span className="text-white font-bold">{selectedApp.dateOfBirth}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Gender</span>
                      <span className="text-white font-bold">{selectedApp.gender}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Nationality</span>
                      <span className="text-white font-bold">{selectedApp.nationality}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Current Location / Country</span>
                      <span className="text-emerald-400 font-bold">{selectedApp.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Application Date</span>
                      <span className="text-gray-300 font-semibold">{selectedApp.appliedDate}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Contact Details */}
                <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-2">
                    <Phone className="w-4 h-4 text-[#10B981]" /> 2. Contact Communication
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Email Address</span>
                      <a href={`mailto:${selectedApp.email}`} className="text-[#0080FF] font-bold hover:underline flex items-center gap-1.5 truncate text-sm">
                        <Mail className="w-4 h-4 shrink-0" /> {selectedApp.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Phone / WhatsApp & Calling Code</span>
                      <a href={`tel:${selectedApp.phone}`} className="text-emerald-400 font-bold hover:underline flex items-center gap-1.5 truncate text-sm">
                        <Phone className="w-4 h-4 shrink-0" /> {selectedApp.phone} {selectedApp.countryCallingCode ? `(${selectedApp.countryCallingCode})` : ""}
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3. Belt Level & Experience */}
                <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-2">
                    <Award className="w-4 h-4 text-amber-400" /> 3. Coach Credentials
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-[#14161D] border border-white/5 space-y-1">
                      <span className="text-gray-400 font-bold uppercase text-[10px] block">Belt Level</span>
                      <span className="text-amber-400 font-black text-base block">{selectedApp.beltLevel || selectedApp.highestRank}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#14161D] border border-white/5 space-y-1">
                      <span className="text-gray-400 font-bold uppercase text-[10px] block">Years of Experience</span>
                      <span className="text-[#0080FF] font-black text-base block">{selectedApp.yearsOfExperience || selectedApp.totalExperience}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Instagram Link */}
                <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-2">
                    <Globe className="w-4 h-4 text-pink-500" /> 4. Instagram Link
                  </div>
                  {selectedApp.instagramUrl ? (
                    <a
                      href={selectedApp.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 font-bold hover:bg-pink-500/20 transition-all flex items-center gap-2.5 w-max truncate"
                    >
                      <Globe className="w-4 h-4 shrink-0" /> <span className="truncate">{selectedApp.instagramUrl}</span>
                    </a>
                  ) : (
                    <p className="text-gray-500 italic">No Instagram link provided.</p>
                  )}
                </div>

                {/* 5. Resume Attachment */}
                <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-2">
                    <Upload className="w-4 h-4 text-emerald-400" /> 5. Mandatory Resume Document
                  </div>
                  <div className="p-4 rounded-xl bg-[#14161D] border border-white/10 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-white font-bold text-xs block">Resume File Attachment</span>
                      <span className="text-gray-400 text-[10px]">Persisted database file reference</span>
                    </div>
                    {selectedApp.resumeUrl ? (
                      <button
                        type="button"
                        disabled={downloadingResumeId === selectedApp.id}
                        onClick={() => handleDownloadResume(selectedApp.id, selectedApp.fullName)}
                        className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#0D9668] disabled:opacity-50 text-white font-black text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-emerald-500/20 cursor-pointer"
                      >
                        {downloadingResumeId === selectedApp.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Download Resume
                      </button>
                    ) : (
                      <span className="text-red-400 font-bold text-xs">No File Uploaded</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div className="p-5 border-t border-white/10 bg-[#0F1117] flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Close Details
                </button>

                <div className="flex items-center gap-3">
                  {selectedApp.status !== "REJECTED" && (
                    <button
                      type="button"
                      disabled={processingId === selectedApp.id}
                      onClick={() => handleStatusUpdate(selectedApp.id, "REJECTED")}
                      className="px-4 py-2.5 rounded-xl bg-[#E50914]/20 hover:bg-[#E50914]/40 disabled:opacity-50 disabled:pointer-events-none text-[#EF4444] border border-[#E50914]/30 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {processingId === selectedApp.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject Candidate
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={processingId === selectedApp.id}
                    onClick={() => handleStatusUpdate(selectedApp.id, "APPROVED")}
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#0D9668] disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#10B981]/25"
                  >
                    {processingId === selectedApp.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {selectedApp.status === "APPROVED" ? "Approved & Active" : "Approve & Move to Active Coaches"}
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
