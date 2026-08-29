"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  Layers,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Users,
  UserCheck,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Edit,
  UserPlus,
  Eye,
  Video,
  ExternalLink,
} from "lucide-react";
import { CreateBatchModal } from "@/components/admin/create-batch-modal";
import { BatchDetailsModal } from "@/components/admin/batch-details-modal";
import { AssignStudentModal } from "@/components/admin/assign-student-modal";
import {
  createBatchAction,
  updateBatchAction,
  assignStudentToBatchAction,
  removeStudentFromBatchAction,
  deactivateOrDeleteBatchAction,
} from "@/actions/batch.actions";

interface AdminBatchesViewProps {
  initialBatches: any[];
  programs: { id: string; title: string; category: string }[];
  plans: { id: string; programId: string; name: string; levelName: string }[];
  coaches: { id: string; fullName: string; email: string; highestRank: string; disciplines: string }[];
  allStudents: {
    id: string;
    name: string;
    email: string;
    phone: string;
    activeProgramId: string | null;
    activeProgramTitle: string;
    activeLevelName: string;
    isEnrolled: boolean;
  }[];
  dayCombinations: string[];
  timeSlots: string[];
}

export function AdminBatchesView({
  initialBatches,
  programs,
  plans,
  coaches,
  allStudents,
  dayCombinations,
  timeSlots,
}: AdminBatchesViewProps) {
  const [batches, setBatches] = useState<any[]>(initialBatches || []);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setBatches(initialBatches || []);
  }, [initialBatches]);

  // Filter States
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "FULL" | "INACTIVE">("ALL");
  const [selectedProgram, setSelectedProgram] = useState<string>("ALL");
  const [selectedCoach, setSelectedCoach] = useState<string>("ALL");
  const [selectedSchedule, setSelectedSchedule] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination / Page Indexing States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any | null>(null);
  const [selectedBatchForDetails, setSelectedBatchForDetails] = useState<any | null>(null);
  const [selectedBatchForAssign, setSelectedBatchForAssign] = useState<any | null>(null);

  // Filter reset handlers
  const handleTabChange = (tab: "ALL" | "ACTIVE" | "FULL" | "INACTIVE") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleProgramChange = (prg: string) => {
    setSelectedProgram(prg);
    setCurrentPage(1);
  };

  const handleCoachChange = (c: string) => {
    setSelectedCoach(c);
    setCurrentPage(1);
  };

  const handleScheduleChange = (sch: string) => {
    setSelectedSchedule(sch);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  // Counts
  const counts = {
    ALL: batches.length,
    ACTIVE: batches.filter((b) => b.status === "ACTIVE").length,
    FULL: batches.filter((b) => b.status === "FULL").length,
    INACTIVE: batches.filter((b) => b.status === "INACTIVE").length,
  };

  // Combined Filtering Logic
  const filteredBatches = batches.filter((b) => {
    // Status tab filter
    if (activeTab !== "ALL" && b.status !== activeTab) return false;

    // Program filter
    if (selectedProgram !== "ALL" && b.programId !== selectedProgram) return false;

    // Coach filter
    if (selectedCoach !== "ALL" && b.coachId !== selectedCoach) return false;

    // Schedule filter
    if (selectedSchedule !== "ALL" && b.dayCombination !== selectedSchedule) return false;

    // Search query filter (Batch Name or Batch ID)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const matchName = b.name.toLowerCase().includes(q);
      const matchId = b.batchId.toLowerCase().includes(q);
      const matchProgram = b.programTitle.toLowerCase().includes(q);
      const matchCoach = b.coachName.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchProgram && !matchCoach) return false;
    }

    return true;
  });

  // Page Indexing Calculations
  const totalItems = filteredBatches.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedBatches = filteredBatches.slice(startIndex, endIndex);

  // Server Action Handlers
  const handleSaveBatch = async (data: any) => {
    if (editingBatch) {
      const res = await updateBatchAction(editingBatch.id, data);
      if (res.success) {
        setNotification({ message: res.message || "Batch updated.", type: "success" });
        setIsCreateModalOpen(false);
        setEditingBatch(null);
        window.location.reload();
      } else {
        throw new Error(res.error || "Failed to update batch.");
      }
    } else {
      const res = await createBatchAction(data);
      if (res.success) {
        setNotification({ message: res.message || "Batch created.", type: "success" });
        setIsCreateModalOpen(false);
        window.location.reload();
      } else {
        throw new Error(res.error || "Failed to create batch.");
      }
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAssignStudent = async (batchId: string, userId: string) => {
    const res = await assignStudentToBatchAction(batchId, userId);
    if (res.success) {
      setNotification({ message: res.message || "Student assigned.", type: "success" });
      setSelectedBatchForAssign(null);
      window.location.reload();
    } else {
      throw new Error(res.error || "Failed to assign student.");
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRemoveStudent = async (batchId: string, userId: string) => {
    const res = await removeStudentFromBatchAction(batchId, userId);
    if (res.success) {
      setNotification({ message: res.message || "Student removed.", type: "success" });
      window.location.reload();
    } else {
      alert(res.error || "Failed to remove student.");
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeactivateBatch = async (batchId: string, deletePermanently: boolean) => {
    const res = await deactivateOrDeleteBatchAction(batchId, deletePermanently);
    if (res.success) {
      setNotification({ message: res.message || "Batch updated.", type: "success" });
      setSelectedBatchForDetails(null);
      window.location.reload();
    } else {
      alert(res.error || "Failed to update batch.");
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

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-outfit)] flex items-center gap-2.5">
              Batch Management System
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Database-driven student batch scheduling, coach conflict validation, and 8-student capacity limits.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingBatch(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#0080FF] hover:bg-[#0066CC] text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg shadow-[#0080FF]/20"
          >
            <Plus className="w-4 h-4" /> Create New Batch
          </button>
        </div>

        {/* Status Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <button
            onClick={() => handleTabChange("ALL")}
            className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
              activeTab === "ALL"
                ? "bg-[#0080FF]/15 border-[#0080FF] text-white shadow-lg shadow-[#0080FF]/10"
                : "bg-[#14161D] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className={`w-4 h-4 ${activeTab === "ALL" ? "text-[#0080FF]" : "text-gray-500"}`} />
              <span className="text-xs font-bold">All Batches</span>
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
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 ${activeTab === "ACTIVE" ? "text-emerald-400" : "text-gray-500"}`} />
              <span className="text-xs font-bold">Active Seats Available</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/30">
              {counts.ACTIVE}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("FULL")}
            className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
              activeTab === "FULL"
                ? "bg-red-500/15 border-red-500 text-white shadow-lg shadow-red-500/10"
                : "bg-[#14161D] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${activeTab === "FULL" ? "text-red-400" : "text-gray-500"}`} />
              <span className="text-xs font-bold">Full Batches</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-black border border-red-500/30">
              {counts.FULL}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("INACTIVE")}
            className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
              activeTab === "INACTIVE"
                ? "bg-gray-500/15 border-gray-500 text-white shadow-lg shadow-gray-500/10"
                : "bg-[#14161D] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className={`w-4 h-4 ${activeTab === "INACTIVE" ? "text-gray-300" : "text-gray-500"}`} />
              <span className="text-xs font-bold">Inactive Batches</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-gray-400 text-xs font-black">
              {counts.INACTIVE}
            </span>
          </button>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="p-4 rounded-2xl bg-[#14161D] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by Batch Name, Batch ID (e.g. BATCH-KUNGFU-101), Program, or Coach..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF] transition-all"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Program Dropdown */}
            <div className="flex items-center gap-2 bg-[#0F1117] border border-white/10 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <select
                value={selectedProgram}
                onChange={(e) => handleProgramChange(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#14161D]">
                  All Programs
                </option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#14161D]">
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Coach Dropdown */}
            <div className="flex items-center gap-2 bg-[#0F1117] border border-white/10 rounded-xl px-3 py-1.5">
              <UserCheck className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <select
                value={selectedCoach}
                onChange={(e) => handleCoachChange(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#14161D]">
                  All Active Coaches
                </option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#14161D]">
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Schedule Dropdown */}
            <div className="flex items-center gap-2 bg-[#0F1117] border border-white/10 rounded-xl px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <select
                value={selectedSchedule}
                onChange={(e) => handleScheduleChange(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#14161D]">
                  All Day Schedules
                </option>
                {dayCombinations.map((dc) => (
                  <option key={dc} value={dc} className="bg-[#14161D]">
                    {dc}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(selectedProgram !== "ALL" ||
              selectedCoach !== "ALL" ||
              selectedSchedule !== "ALL" ||
              searchQuery !== "") && (
              <button
                onClick={() => {
                  setSelectedProgram("ALL");
                  setSelectedCoach("ALL");
                  setSelectedSchedule("ALL");
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

        {/* Batches Cards Grid */}
        {paginatedBatches.length === 0 ? (
          <div className="rounded-3xl p-12 bg-[#14161D] border border-white/10 text-center space-y-4 max-w-xl mx-auto shadow-xl">
            <Layers className="w-12 h-12 text-gray-600 mx-auto opacity-50" />
            <h3 className="text-lg font-bold text-white">No Batches Found</h3>
            <p className="text-xs text-gray-400">
              {batches.length === 0
                ? "No batches created in the database yet. Click 'Create New Batch' above to create your first batch."
                : "No batch matches your active filter or search criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedBatches.map((b) => {
                const capacityPercent = Math.min(
                  100,
                  Math.round((b.studentCount / (b.maxCapacity || 8)) * 100)
                );
                const isFull = b.status === "FULL" || b.studentCount >= b.maxCapacity;

                return (
                  <div
                    key={b.id}
                    className={`bg-[#14161D] border rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between transition-all ${
                      isFull
                        ? "border-red-500/30 bg-red-500/[0.02]"
                        : b.status === "INACTIVE"
                        ? "border-white/5 opacity-60"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Header & Status Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-gray-300 border border-white/10">
                          {b.batchId}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                            isFull
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : b.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-white/10 text-gray-400 border-white/10"
                          }`}
                        >
                          {isFull ? "FULL" : b.status}
                        </span>
                      </div>

                      {/* Batch Name & Program */}
                      <div>
                        <h3 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)] leading-tight">
                          {b.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[#0080FF] font-bold">{b.programTitle}</span>
                          <span className="px-2 py-0.5 rounded-md bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-black text-[10px]">
                            {b.levelName}
                          </span>
                        </div>
                      </div>

                      {/* Assigned Coach */}
                      <div className="p-3 rounded-xl bg-[#0F1117] border border-white/5 space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-400 text-[10px] uppercase font-extrabold tracking-wider">
                          <UserCheck className="w-3 h-3 text-[#0080FF]" /> Assigned Coach:
                        </div>
                        <p className="text-white font-bold text-xs">{b.coachName}</p>
                        <p className="text-gray-400 text-[11px] truncate">{b.coachDisciplines}</p>
                      </div>

                      {/* Schedule Info */}
                      <div className="space-y-1 text-xs text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#0080FF] shrink-0" />
                          <span className="font-bold text-white">{b.dayCombination}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-gray-300 font-semibold">{b.timeSlot} ({b.clockTiming})</span>
                        </div>
                      </div>

                      {/* Meeting Link Badge & Join Button */}
                      <div className="p-2.5 rounded-xl bg-[#0F1117] border border-white/5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs truncate">
                          <Video className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                          {b.meetingUrl ? (
                            <span className="text-[#10B981] font-semibold text-[11px] truncate">
                              Meeting Link Set
                            </span>
                          ) : (
                            <span className="text-gray-500 text-[11px] italic">No link set</span>
                          )}
                        </div>

                        {b.meetingUrl ? (
                          <a
                            href={b.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-[#10B981] hover:bg-[#059669] text-black font-extrabold text-[11px] transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-sm shadow-[#10B981]/20"
                          >
                            <Video className="w-3 h-3 fill-current" />
                            Join Meet
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingBatch(b);
                              setIsCreateModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-bold border border-white/10 transition-all shrink-0 cursor-pointer"
                          >
                            + Add Link
                          </button>
                        )}
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="space-y-1.5 pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400 text-[11px] font-semibold">Capacity Fill:</span>
                          <span className="font-black text-white">{b.capacityLabel} Students</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isFull
                                ? "bg-red-500"
                                : "bg-gradient-to-r from-[#0080FF] to-[#10B981]"
                            }`}
                            style={{ width: `${capacityPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedBatchForDetails(b)}
                        className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1 border border-white/10"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#0080FF]" /> View Details ({b.studentCount})
                      </button>

                      <button
                        onClick={() => setSelectedBatchForAssign(b)}
                        disabled={isFull}
                        className="py-2 px-3 rounded-xl bg-[#0080FF]/15 hover:bg-[#0080FF]/30 disabled:opacity-30 disabled:pointer-events-none text-[#0080FF] border border-[#0080FF]/30 text-xs font-bold transition-all flex items-center gap-1"
                        title="Assign Student"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Assign
                      </button>

                      <button
                        onClick={() => {
                          setEditingBatch(b);
                          setIsCreateModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all"
                        title="Edit Batch"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
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
                    <span className="text-[#0080FF] font-extrabold">{totalItems}</span> batches
                  </>
                ) : (
                  "No batch records to display"
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <span>Per Page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-[#0F1117] border border-white/10 rounded-lg px-2.5 py-1 text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value={6}>6</option>
                    <option value={9}>9</option>
                    <option value={18}>18</option>
                    <option value={36}>36</option>
                  </select>
                </div>

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
        <CreateBatchModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingBatch(null);
          }}
          initialData={editingBatch}
          programs={programs}
          plans={plans}
          coaches={coaches}
          dayCombinations={dayCombinations}
          timeSlots={timeSlots}
          onConfirm={handleSaveBatch}
        />

        <BatchDetailsModal
          isOpen={!!selectedBatchForDetails}
          onClose={() => setSelectedBatchForDetails(null)}
          batch={selectedBatchForDetails}
          onOpenAssignModal={(b) => setSelectedBatchForAssign(b)}
          onRemoveStudent={handleRemoveStudent}
          onDeactivateBatch={handleDeactivateBatch}
        />

        <AssignStudentModal
          isOpen={!!selectedBatchForAssign}
          onClose={() => setSelectedBatchForAssign(null)}
          batch={selectedBatchForAssign}
          allStudents={allStudents}
          onConfirmAssign={handleAssignStudent}
        />
      </div>
    </AdminShell>
  );
}
