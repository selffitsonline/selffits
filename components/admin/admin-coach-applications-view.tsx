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
  Eye,
  X,
  ExternalLink,
  ShieldCheck,
  Globe,
  MapPin,
  FileCheck,
  User,
  Upload,
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

const DAYS_LIST = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = ["Morning", "Afternoon", "Evening"];

export function AdminCoachApplicationsView({ initialApplications }: AdminCoachApplicationsViewProps) {
  const [applications, setApplications] = useState<any[]>(initialApplications || []);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Selected Application for Detail Modal
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

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
        if (selectedApp?.id === id) setSelectedApp(null);
        setMsg({
          type: "success",
          text: "Coach application approved! Candidate has been moved to the Active Coaches directory.",
        });
      } else {
        // For REJECTED, update local status
        setApplications((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedApp?.id === id) {
          setSelectedApp((prev: any) => (prev ? { ...prev, status: newStatus } : null));
        }
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
              Review submitted coach applications, inspect full candidate details, download resumes, and manage approvals.
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
                    {app.profilePhotoUrl ? (
                      <img
                        src={app.profilePhotoUrl}
                        alt={app.fullName}
                        className="w-10 h-10 rounded-xl object-cover border border-white/15 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#0080FF]/20 border border-[#0080FF]/30 flex items-center justify-center text-[#0080FF] font-black text-sm shrink-0">
                        {app.fullName?.charAt(0) || "C"}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
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
                      {app.location && (
                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" /> {app.location} {app.nationality ? `(${app.nationality})` : ""}
                        </p>
                      )}
                    </div>
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

                <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(app)}
                    className="px-3.5 py-2 rounded-xl bg-[#0080FF]/20 hover:bg-[#0080FF]/35 text-[#0080FF] border border-[#0080FF]/30 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md shadow-[#0080FF]/10"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </button>

                  {app.resumeUrl ? (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0080FF]" /> Resume
                    </a>
                  ) : null}

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

        {/* FULL CANDIDATE APPLICATION DETAILS MODAL */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-[#14161D] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 bg-[#0F1117] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {selectedApp.profilePhotoUrl ? (
                    <img
                      src={selectedApp.profilePhotoUrl}
                      alt={selectedApp.fullName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#0080FF]/40 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0080FF] to-[#0055B3] flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                      {selectedApp.fullName?.charAt(0) || "C"}
                    </div>
                  )}

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
                          <MapPin className="w-3.5 h-3.5" /> {selectedApp.location}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-all"
                  title="Close Details Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-gray-300">
                
                {/* 1. Personal Details */}
                <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-2">
                    <User className="w-4 h-4 text-[#0080FF]" /> 1. Personal Details
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Full Name</span>
                      <span className="text-white font-extrabold text-sm">{selectedApp.fullName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Email Address</span>
                      <a href={`mailto:${selectedApp.email}`} className="text-[#0080FF] font-bold hover:underline flex items-center gap-1 truncate">
                        <Mail className="w-3.5 h-3.5 shrink-0" /> {selectedApp.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Phone / WhatsApp</span>
                      <a href={`tel:${selectedApp.phone}`} className="text-emerald-400 font-bold hover:underline flex items-center gap-1 truncate">
                        <Phone className="w-3.5 h-3.5 shrink-0" /> {selectedApp.phone}
                      </a>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Location / Country</span>
                      <span className="text-white font-semibold">{selectedApp.location || "Not specified"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Nationality</span>
                      <span className="text-white font-semibold">{selectedApp.nationality || "Not specified"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Profile Photo</span>
                      {selectedApp.profilePhotoUrl ? (
                        <a href={selectedApp.profilePhotoUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5" /> View Photo Link
                        </a>
                      ) : (
                        <span className="text-gray-500">None uploaded</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Coaching Disciplines */}
                <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-2">
                    <Award className="w-4 h-4 text-[#0080FF]" /> 2. Qualified Disciplines
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedApp.rawDisciplines && selectedApp.rawDisciplines.length > 0 ? (
                      selectedApp.rawDisciplines.map((disc: string) => (
                        <span
                          key={disc}
                          className="px-3 py-1 rounded-xl bg-[#0080FF]/15 border border-[#0080FF]/30 text-[#0080FF] font-extrabold text-xs"
                        >
                          ✓ {disc}
                        </span>
                      ))
                    ) : (
                      <span className="text-white font-semibold">{selectedApp.disciplines}</span>
                    )}
                  </div>
                </div>

                {/* 3. Qualifications & Experience */}
                <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> 3. Qualifications & Experience
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Highest Rank / Qualification</span>
                      <span className="text-white font-bold text-sm">{selectedApp.highestRank}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-0.5">Total Coaching Experience</span>
                      <span className="text-amber-400 font-extrabold text-sm">{selectedApp.totalExperience}</span>
                    </div>
                  </div>

                  {selectedApp.targetAgeGroups && selectedApp.targetAgeGroups.length > 0 && (
                    <div className="pt-2">
                      <span className="text-gray-500 font-bold uppercase text-[10px] block mb-1.5">Age Groups Can Coach</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.targetAgeGroups.map((age: string) => (
                          <span
                            key={age}
                            className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs"
                          >
                            • {age}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Weekly Availability Schedule */}
                <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-2">
                    <Calendar className="w-4 h-4 text-amber-400" /> 4. Weekly Availability Schedule
                  </div>
                  
                  {selectedApp.availability && Object.keys(selectedApp.availability).length > 0 ? (
                    <div className="overflow-x-auto pt-1">
                      <table className="w-full text-xs text-center border-collapse min-w-[450px]">
                        <thead>
                          <tr className="border-b border-white/10 text-gray-400 font-bold uppercase text-[10px]">
                            <th className="py-2 px-2 text-left">Day</th>
                            {TIME_SLOTS.map((slot) => (
                              <th key={slot} className="py-2 px-2">{slot}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {DAYS_LIST.map((day) => {
                            const daySlots: string[] = selectedApp.availability[day] || [];
                            return (
                              <tr key={day} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <td className="py-2 px-2 font-bold text-white text-left">{day}</td>
                                {TIME_SLOTS.map((slot) => {
                                  const isAvailable = daySlots.includes(slot);
                                  return (
                                    <td key={slot} className="py-2 px-2">
                                      <span
                                        className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${
                                          isAvailable
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            : "bg-white/5 text-gray-600"
                                        }`}
                                      >
                                        {isAvailable ? "✓ Available" : "—"}
                                      </span>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No custom availability slots submitted.</p>
                  )}
                </div>

                {/* 5. Portfolio & Social Profiles */}
                <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-2">
                    <Globe className="w-4 h-4 text-[#0080FF]" /> 5. Social & Online Links
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {selectedApp.instagramUrl ? (
                      <a
                        href={selectedApp.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 font-bold hover:bg-pink-500/20 transition-all flex items-center gap-2 truncate"
                      >
                        <Globe className="w-4 h-4 shrink-0" /> <span className="truncate">Instagram Profile</span>
                      </a>
                    ) : null}

                    {selectedApp.facebookUrl ? (
                      <a
                        href={selectedApp.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold hover:bg-blue-500/20 transition-all flex items-center gap-2 truncate"
                      >
                        <Globe className="w-4 h-4 shrink-0" /> <span className="truncate">Facebook Profile</span>
                      </a>
                    ) : null}

                    {selectedApp.youtubeUrl ? (
                      <a
                        href={selectedApp.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold hover:bg-red-500/20 transition-all flex items-center gap-2 truncate"
                      >
                        <ExternalLink className="w-4 h-4 shrink-0" /> <span className="truncate">YouTube Channel</span>
                      </a>
                    ) : null}

                    {!selectedApp.instagramUrl && !selectedApp.facebookUrl && !selectedApp.youtubeUrl && (
                      <p className="text-gray-500 italic col-span-3">No social profile links submitted.</p>
                    )}
                  </div>
                </div>

                {/* 6. Uploaded Documents & Certificates */}
                <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-2">
                    <Upload className="w-4 h-4 text-emerald-400" /> 6. Candidate Documents & Attachments
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* CV / Resume */}
                    <div className="p-4 rounded-xl bg-[#14161D] border border-white/10 space-y-2 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-white font-bold text-xs block">CV / Resume File</span>
                        <span className="text-gray-500 text-[10px]">Candidate professional resume</span>
                      </div>
                      {selectedApp.resumeUrl ? (
                        <a
                          href={selectedApp.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-[#0080FF] hover:bg-[#0066CC] text-white font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-[#0080FF]/20"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      ) : (
                        <span className="text-gray-500 font-semibold text-xs">Not Provided</span>
                      )}
                    </div>

                    {/* Qualification Certificates */}
                    <div className="p-4 rounded-xl bg-[#14161D] border border-white/10 space-y-2 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-white font-bold text-xs block">Certificates Folder / File</span>
                        <span className="text-gray-500 text-[10px]">Martial arts & fitness certificates</span>
                      </div>
                      {selectedApp.qualificationCertsUrl ? (
                        <a
                          href={selectedApp.qualificationCertsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-emerald-500/20"
                        >
                          <Download className="w-3.5 h-3.5" /> Certificates
                        </a>
                      ) : (
                        <span className="text-gray-500 font-semibold text-xs">Not Provided</span>
                      )}
                    </div>

                    {/* Instructor License (if uploaded in past) */}
                    {selectedApp.licenseUrl && (
                      <div className="p-4 rounded-xl bg-[#14161D] border border-white/10 space-y-2 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-white font-bold text-xs block">Instructor License</span>
                          <span className="text-gray-500 text-[10px]">Teaching accreditation license</span>
                        </div>
                        <a
                          href={selectedApp.licenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-amber-500/20"
                        >
                          <Download className="w-3.5 h-3.5" /> View License
                        </a>
                      </div>
                    )}

                    {/* ID / Passport (if uploaded in past) */}
                    {selectedApp.idPassportUrl && (
                      <div className="p-4 rounded-xl bg-[#14161D] border border-white/10 space-y-2 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-white font-bold text-xs block">ID / Passport Document</span>
                          <span className="text-gray-500 text-[10px]">Identity verification file</span>
                        </div>
                        <a
                          href={selectedApp.idPassportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-purple-500/20"
                        >
                          <Download className="w-3.5 h-3.5" /> View Identity
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* 7. Declaration Confirmation */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300 font-bold text-xs">
                      Candidate agreed to SELFFITS coach terms & accuracy declaration.
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px]">
                    VERIFIED
                  </span>
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
                      onClick={() => handleStatusUpdate(selectedApp.id, "REJECTED")}
                      className="px-4 py-2.5 rounded-xl bg-[#E50914]/20 hover:bg-[#E50914]/40 text-[#EF4444] border border-[#E50914]/30 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> Reject Candidate
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(selectedApp.id, "APPROVED")}
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#0D9668] text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#10B981]/25"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Move to Active Coaches
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
