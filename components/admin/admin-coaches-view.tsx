"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  UserCheck,
  Mail,
  Phone,
  Award,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { EditCoachDisciplinesModal } from "@/components/admin/edit-coach-disciplines-modal";
import { SuspendCoachModal } from "@/components/admin/suspend-coach-modal";
import { DeleteCoachModal } from "@/components/admin/delete-coach-modal";
import {
  toggleSuspendCoachAction,
  deleteCoachAccountAction,
  updateCoachDisciplinesAction,
} from "@/actions/admin.actions";

interface AdminCoachesViewProps {
  initialCoaches: any[];
}

const SPECIALIZATION_CATEGORIES = [
  "Karate",
  "Kung Fu",
  "Taekwondo",
  "Kickboxing",
  "Yoga",
  "Fitness / Functional Training",
];

export function AdminCoachesView({ initialCoaches }: AdminCoachesViewProps) {
  const [coaches, setCoaches] = useState<any[]>(initialCoaches || []);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Filter States
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination / Page Indexing States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(9);

  // Modals
  const [selectedCoachForEdit, setSelectedCoachForEdit] = useState<any | null>(null);
  const [selectedCoachForSuspend, setSelectedCoachForSuspend] = useState<any | null>(null);
  const [selectedCoachForDelete, setSelectedCoachForDelete] = useState<any | null>(null);

  // Handlers resetting page to 1
  const handleTabChange = (tab: "ALL" | "ACTIVE" | "SUSPENDED") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSpecializationChange = (spec: string) => {
    setSelectedSpecialization(spec);
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

  // Counts calculations
  const counts = {
    ALL: coaches.length,
    ACTIVE: coaches.filter((c) => !c.isSuspended).length,
    SUSPENDED: coaches.filter((c) => c.isSuspended).length,
  };

  // Filter logic combined
  const filteredCoaches = coaches.filter((coach) => {
    // Tab Filter
    if (activeTab === "ACTIVE" && coach.isSuspended) return false;
    if (activeTab === "SUSPENDED" && !coach.isSuspended) return false;

    // Specialization Filter
    if (selectedSpecialization !== "ALL") {
      const rawDisc: string[] = coach.rawDisciplines || [];
      const discStr: string = coach.disciplines || "";
      const matchesRaw = rawDisc.some((d) => d.toLowerCase().includes(selectedSpecialization.toLowerCase()));
      const matchesString = discStr.toLowerCase().includes(selectedSpecialization.toLowerCase());
      if (!matchesRaw && !matchesString) return false;
    }

    // Search Query Filter (Name, Email, Phone)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const matchName = coach.fullName?.toLowerCase().includes(q);
      const matchEmail = coach.email?.toLowerCase().includes(q);
      const matchPhone = coach.phone?.toLowerCase().includes(q);
      const matchRank = coach.highestRank?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchRank) return false;
    }

    return true;
  });

  // Page Indexing Calculations
  const totalItems = filteredCoaches.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCoaches = filteredCoaches.slice(startIndex, endIndex);

  // Suspend/Reactivate Handler
  const handleSuspendConfirm = async (coachId: string, willSuspend: boolean) => {
    const res = await toggleSuspendCoachAction(coachId, willSuspend);
    if (res.success) {
      setCoaches((prev) =>
        prev.map((c) =>
          c.id === coachId
            ? {
                ...c,
                isSuspended: willSuspend,
                status: willSuspend ? "SUSPENDED" : "APPROVED",
              }
            : c
        )
      );
      setNotification({ message: res.message || "Coach status updated.", type: "success" });
    } else {
      setNotification({ message: res.error || "Failed to update status.", type: "error" });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // Delete Handler
  const handleDeleteConfirm = async (coachId: string) => {
    const res = await deleteCoachAccountAction(coachId);
    if (res.success) {
      setCoaches((prev) => prev.filter((c) => c.id !== coachId));
      setNotification({ message: "Coach account permanently deleted.", type: "success" });
    } else {
      setNotification({ message: res.error || "Failed to delete coach account.", type: "error" });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // Update Specializations Handler
  const handleUpdateDisciplinesConfirm = async (coachId: string, newDisciplines: string[]) => {
    const res = await updateCoachDisciplinesAction(coachId, newDisciplines);
    if (res.success) {
      setCoaches((prev) =>
        prev.map((c) =>
          c.id === coachId
            ? {
                ...c,
                rawDisciplines: newDisciplines,
                disciplines: newDisciplines.length > 0 ? newDisciplines.join(", ") : "Fitness / Functional Training",
              }
            : c
        )
      );
      setNotification({ message: "Coach specializations updated.", type: "success" });
    } else {
      setNotification({ message: res.error || "Failed to update specializations.", type: "error" });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition-all animate-in fade-in ${
              notification.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/15 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-xs hover:underline font-semibold">
              Dismiss
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Active Verified Coaches Directory
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Certified academy instructors, specialization categories, account suspension, and management controls.
            </p>
          </div>

          <Link
            href="/admin/coach-applications"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#0080FF]" /> Review Pending Leads
          </Link>
        </div>

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
              <UserCheck className={`w-4 h-4 ${activeTab === "ALL" ? "text-[#0080FF]" : "text-gray-500"}`} />
              <span className="text-xs font-bold">All Instructors</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-black">{counts.ALL}</span>
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
              <ShieldCheck className={`w-4 h-4 ${activeTab === "ACTIVE" ? "text-emerald-400" : "text-gray-500"}`} />
              <span className="text-xs font-bold">Active Coaches</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/30">
              {counts.ACTIVE}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("SUSPENDED")}
            className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
              activeTab === "SUSPENDED"
                ? "bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10"
                : "bg-[#14161D] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className={`w-4 h-4 ${activeTab === "SUSPENDED" ? "text-amber-400" : "text-gray-500"}`} />
              <span className="text-xs font-bold">Suspended</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black border border-amber-500/30">
              {counts.SUSPENDED}
            </span>
          </button>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="p-4 rounded-2xl bg-[#14161D] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search coach by name, email address, or phone number..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF] transition-all"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          </div>

          {/* Specialization Filter Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0F1117] border border-white/10 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <select
                value={selectedSpecialization}
                onChange={(e) => handleSpecializationChange(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#14161D]">
                  All Specializations
                </option>
                {SPECIALIZATION_CATEGORIES.map((spec) => (
                  <option key={spec} value={spec} className="bg-[#14161D]">
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(selectedSpecialization !== "ALL" || searchQuery !== "") && (
              <button
                onClick={() => {
                  setSelectedSpecialization("ALL");
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

        {/* Coach Cards Grid */}
        {paginatedCoaches.length === 0 ? (
          <div className="rounded-3xl p-12 bg-[#14161D] border border-white/10 text-center space-y-4 max-w-xl mx-auto shadow-xl">
            <UserCheck className="w-12 h-12 text-gray-600 mx-auto opacity-50" />
            <h3 className="text-lg font-bold text-white">No Matching Coaches Found</h3>
            <p className="text-xs text-gray-400">
              {coaches.length === 0
                ? "No approved coaches currently registered in the database."
                : "No coach matches your active search or specialization filter criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCoaches.map((coach) => {
                const specList: string[] = coach.rawDisciplines || [];

                return (
                  <div
                    key={coach.id}
                    className={`bg-[#14161D] border rounded-2xl p-6 space-y-5 shadow-xl flex flex-col justify-between transition-all ${
                      coach.isSuspended
                        ? "border-amber-500/30 bg-amber-500/[0.02]"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0080FF] to-[#0055B3] text-white flex items-center justify-center font-black text-lg shadow-lg shrink-0">
                          {coach.fullName[0]?.toUpperCase()}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            coach.isSuspended
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          {coach.isSuspended ? "Suspended" : "Active Coach"}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)]">
                          {coach.fullName}
                        </h3>
                        <p className="text-xs text-[#0080FF] font-bold mt-0.5">{coach.highestRank}</p>
                      </div>

                      {/* Specialization Categories Pills */}
                      <div className="space-y-1.5 pt-2 border-t border-white/10">
                        <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                          Specializations:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {specList.length > 0 ? (
                            specList.map((spec) => (
                              <span
                                key={spec}
                                className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-[11px] font-bold"
                              >
                                {spec}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-[11px]">Fitness / Functional Training</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-300 pt-2 border-t border-white/10">
                        <p className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[#0080FF] shrink-0" /> {coach.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {coach.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {coach.experience} Experience
                        </p>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[11px] text-gray-400 pb-1">
                        <span>Approved: {coach.createdAt}</span>
                        {coach.resumeUrl && (
                          <a
                            href={coach.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0080FF] hover:underline font-bold flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> Resume
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Edit Specializations */}
                        <button
                          onClick={() => setSelectedCoachForEdit(coach)}
                          className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/10"
                        >
                          <Edit className="w-3.5 h-3.5 text-[#0080FF]" /> Edit Specs
                        </button>

                        {/* Suspend / Reactivate */}
                        <button
                          onClick={() => setSelectedCoachForSuspend(coach)}
                          className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 border ${
                            coach.isSuspended
                              ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {coach.isSuspended ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" /> Reactivate
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3.5 h-3.5" /> Suspend
                            </>
                          )}
                        </button>

                        {/* Permanent Delete */}
                        <button
                          onClick={() => setSelectedCoachForDelete(coach)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all"
                          title="Permanently Delete Coach"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Page Indexing / Pagination Bar */}
            <div className="p-4 rounded-2xl bg-[#14161D] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="text-gray-400 font-medium">
                {totalItems > 0 ? (
                  <>
                    Showing <span className="text-white font-bold">{startIndex + 1}</span> to{" "}
                    <span className="text-white font-bold">{endIndex}</span> of{" "}
                    <span className="text-[#0080FF] font-extrabold">{totalItems}</span> coaches
                  </>
                ) : (
                  "No coach records display"
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
                    <option value={6}>6</option>
                    <option value={9}>9</option>
                    <option value={18}>18</option>
                    <option value={36}>36</option>
                  </select>
                </div>

                {/* Page Navigation Controls */}
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

        {/* Modals */}
        <EditCoachDisciplinesModal
          isOpen={!!selectedCoachForEdit}
          onClose={() => setSelectedCoachForEdit(null)}
          coach={selectedCoachForEdit}
          onConfirm={handleUpdateDisciplinesConfirm}
        />

        <SuspendCoachModal
          isOpen={!!selectedCoachForSuspend}
          onClose={() => setSelectedCoachForSuspend(null)}
          coach={selectedCoachForSuspend}
          onConfirm={handleSuspendConfirm}
        />

        <DeleteCoachModal
          isOpen={!!selectedCoachForDelete}
          onClose={() => setSelectedCoachForDelete(null)}
          coach={selectedCoachForDelete}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </AdminShell>
  );
}
