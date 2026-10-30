"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import {
  X,
  UserPlus,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { getEligibleStudentsForBatchAction } from "@/actions/batch.actions";

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  activeProgramId?: string | null;
  activeProgramTitle?: string;
  activePlanId?: string | null;
  activeLevelName?: string;
  martialArtsType?: string | null;
  isEnrolled?: boolean;
  purchaseDate?: string;
  purchaseDateShort?: string;
  purchaseTimestamp?: number;
  enrolledProgramIds?: string[];
  enrolledPrograms?: Array<{
    programId: string;
    programTitle: string;
    category?: string;
    targetAudience?: string;
    planName?: string;
    levelName?: string;
    purchaseDate?: string;
    purchaseTimestamp?: number;
  }>;
  assignedBatches?: Array<{
    batchId: string;
    batchName: string;
    programId: string;
  }>;
  assignedBatchIds?: string[];
  otherBatches?: Array<{
    batchId: string;
    batchName: string;
  }>;
}

interface AssignStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: {
    id: string;
    batchId: string;
    name: string;
    programId: string;
    programTitle: string;
    programCategory?: string;
    targetAudience?: string;
    levelName: string;
    maxCapacity: number;
    studentCount: number;
    status: string;
    students: { id: string }[];
  } | null;
  allStudents: StudentRecord[];
  onConfirmAssign: (batchId: string, userId: string) => Promise<void>;
}

export function AssignStudentModal({
  isOpen,
  onClose,
  batch,
  allStudents,
  onConfirmAssign,
}: AssignStudentModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [remoteStudents, setRemoteStudents] = useState<StudentRecord[] | null>(null);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Reset local state when modal closes or opens with a new batch
  useEffect(() => {
    if (isOpen && batch) {
      setSearchQuery("");
      setSelectedStudentId(null);
      setErrorMsg("");
      setRemoteStudents(null);

      // Asynchronously fetch fresh eligible students directly for this batch
      let isMounted = true;
      setIsFetchingRemote(true);
      getEligibleStudentsForBatchAction(batch.id)
        .then((res) => {
          if (isMounted && res.success && Array.isArray(res.students)) {
            setRemoteStudents(res.students as StudentRecord[]);
          }
        })
        .catch((err) => {
          console.warn("Could not fetch remote eligible students:", err);
        })
        .finally(() => {
          if (isMounted) setIsFetchingRemote(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, batch?.id]);

  // Compute eligible unassigned students sorted by purchase date, newest first
  const eligibleStudents = useMemo(() => {
    if (!batch) return [];

    // If fresh remote data is loaded and has students, prioritize it
    if (remoteStudents !== null && remoteStudents.length > 0) {
      return remoteStudents;
    }

    // Otherwise, compute from passed allStudents (or remoteStudents if allStudents is empty)
    const currentAssignedUserIds = batch.students.map((s) => s.id);
    const sourceStudents = (allStudents && allStudents.length > 0) ? allStudents : (remoteStudents || []);

    const unassigned = sourceStudents.filter((std) => {
      // Must not already be assigned to this batch
      return !currentAssignedUserIds.includes(std.id);
    });

    // Helper for fitness category comparison
    const isFitness = (cat?: string) => cat === "FITNESS_WEIGHT_LOSS" || cat === "FITNESS_HIIT";

    // Partition into compatible matches vs general purchased students
    const compatible: StudentRecord[] = [];
    const otherPurchased: StudentRecord[] = [];

    unassigned.forEach((std) => {
      const matchesEnrolledIds =
        Array.isArray(std.enrolledProgramIds) && std.enrolledProgramIds.includes(batch.programId);
      const matchesActiveId = std.activeProgramId === batch.programId;
      const matchesProgramsList =
        Array.isArray(std.enrolledPrograms) &&
        std.enrolledPrograms.some((p) => {
          if (p.programId === batch.programId) return true;
          if (batch.programCategory && batch.targetAudience && p.category && p.targetAudience) {
            const audienceMatch = p.targetAudience === batch.targetAudience;
            const categoryMatch =
              p.category === batch.programCategory ||
              (isFitness(p.category) && isFitness(batch.programCategory));
            return audienceMatch && categoryMatch;
          }
          return false;
        });

      if (matchesEnrolledIds || matchesActiveId || matchesProgramsList || (std as any).isDirectMatch) {
        compatible.push(std);
      } else {
        otherPurchased.push(std);
      }
    });

    // Sort by purchase/enrollment date, newest first
    const sortByDate = (a: StudentRecord, b: StudentRecord) => {
      const timeA = a.purchaseTimestamp || 0;
      const timeB = b.purchaseTimestamp || 0;
      return timeB - timeA;
    };

    compatible.sort(sortByDate);
    otherPurchased.sort(sortByDate);

    // If compatible students exist, show them first, followed by other purchased students
    return [...compatible, ...otherPurchased];
  }, [batch, remoteStudents, allStudents]);

  // Live autocomplete search filtering (name, email, phone)
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return eligibleStudents;

    return eligibleStudents.filter((std) => {
      const matchName = (std.name || "").toLowerCase().includes(q);
      const matchEmail = (std.email || "").toLowerCase().includes(q);
      const matchPhone = (std.phone || "").toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone;
    });
  }, [eligibleStudents, searchQuery]);

  if (!isOpen || !batch) return null;

  const isFull = batch.studentCount >= batch.maxCapacity;
  const selectedStudent = filteredStudents.find((s) => s.id === selectedStudentId);

  const handleAssign = async (userId: string) => {
    if (isFull) {
      setErrorMsg(
        `Batch "${batch.name}" is FULL (${batch.studentCount}/${batch.maxCapacity}). Cannot assign more students.`
      );
      return;
    }
    setLoadingUserId(userId);
    setErrorMsg("");
    try {
      await onConfirmAssign(batch.id, userId);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to assign student.");
      setLoadingUserId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#14161D] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)] truncate">
              Assign Student to Batch
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              Batch: <span className="text-white font-semibold">{batch.name}</span> •{" "}
              <span className="text-gray-300">{batch.programTitle}</span>
            </p>
          </div>
        </div>

        {/* Capacity Banner */}
        <div className="p-3 rounded-xl bg-[#0F1117] border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-semibold">Seat Capacity:</span>
            <span className="text-gray-300 font-mono">
              {batch.studentCount} / {batch.maxCapacity} Seats
            </span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-black border ${
              isFull
                ? "bg-red-500/20 text-red-400 border-red-500/30"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            }`}
          >
            {isFull ? "BATCH FULL" : `${batch.maxCapacity - batch.studentCount} Seats Available`}
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* Live Search & Autocomplete Input */}
        <div className="space-y-1.5">
          <div className="relative">
            <input
              type="text"
              autoFocus
              placeholder="Search by student name, email address, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF] transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-gray-500 hover:text-white p-0.5 rounded transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Status & Newest Purchases Label */}
          <div className="flex items-center justify-between px-1 text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#0080FF]" />
              {searchQuery.trim() ? (
                <span>
                  Found <strong className="text-white">{filteredStudents.length}</strong> matching{" "}
                  {filteredStudents.length === 1 ? "student" : "students"}
                </span>
              ) : (
                <span>
                  Recently Purchased Students (
                  <strong className="text-white">{eligibleStudents.length}</strong> eligible)
                </span>
              )}
            </div>

            {isFetchingRemote && (
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <RefreshCw className="w-2.5 h-2.5 animate-spin text-[#0080FF]" />
                <span>Checking latest enrollments...</span>
              </div>
            )}
          </div>
        </div>

        {/* Student List (Scrollable) */}
        <div className="overflow-y-auto space-y-2.5 flex-1 max-h-72 pr-1 custom-scrollbar">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-[#0F1117] rounded-xl border border-white/5 space-y-2">
              <UserCheck className="w-8 h-8 text-gray-600 mx-auto opacity-40" />
              <p className="font-bold text-gray-400 text-xs">
                {searchQuery.trim()
                  ? `No students matching "${searchQuery}"`
                  : "No eligible unassigned students found"}
              </p>
              <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                {searchQuery.trim() ? (
                  <span>
                    Try searching with another name, email address, or phone number.
                  </span>
                ) : (
                  <span>
                    Only students with a successful purchase or active enrollment in{" "}
                    <strong className="text-white font-semibold">{batch.programTitle}</strong> appear
                    here.
                  </span>
                )}
              </p>
              {searchQuery.trim() && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs text-[#0080FF] hover:underline font-semibold"
                >
                  Clear search query
                </button>
              )}
            </div>
          ) : (
            filteredStudents.map((std, index) => {
              const isLoading = loadingUserId === std.id;
              const isSelected = selectedStudentId === std.id;
              const purchaseDateDisplay = std.purchaseDate || std.purchaseDateShort || "Recent";
              const isNewest = index === 0 && !searchQuery.trim();

              return (
                <div
                  key={std.id}
                  onClick={() => setSelectedStudentId(std.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#0080FF]/10 border-[#0080FF] shadow-lg shadow-[#0080FF]/10"
                      : "bg-[#0F1117] border-white/5 hover:border-white/20 hover:bg-[#12151D]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      {/* Name & Newest Badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-white text-xs tracking-wide">
                          {std.name}
                        </span>
                        {isNewest && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                            Latest Purchase
                          </span>
                        )}
                        {std.otherBatches && std.otherBatches.length > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] font-semibold">
                            Also in: {std.otherBatches.map((b) => b.batchName).join(", ")}
                          </span>
                        )}
                      </div>

                      {/* Contact Info (Email & Phone) */}
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 text-gray-500 shrink-0" />
                          <span className="text-gray-300 font-mono text-[10.5px] truncate">
                            {std.email}
                          </span>
                        </span>
                        {std.phone && std.phone !== "Not provided" && (
                          <span className="flex items-center gap-1 shrink-0">
                            <Phone className="w-3 h-3 text-gray-500 shrink-0" />
                            <span className="text-gray-400 font-mono text-[10.5px]">
                              {std.phone}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Purchase Date & Program Enrollment Tag */}
                      <div className="flex items-center gap-2.5 pt-1 text-[10px] text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1 text-[#0080FF] font-medium bg-[#0080FF]/10 px-2 py-0.5 rounded border border-[#0080FF]/20">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>Purchased: {purchaseDateDisplay}</span>
                        </span>

                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Layers className="w-3 h-3 shrink-0 text-emerald-500" />
                          <span>
                            {std.activeProgramTitle || batch.programTitle}
                            {std.activeLevelName ? ` • ${std.activeLevelName}` : ""}
                          </span>
                        </span>

                        {std.martialArtsType && (
                          <span className="px-1.5 py-0.5 rounded bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30 font-bold">
                            {std.martialArtsType}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Direct Assign Button */}
                    <div className="shrink-0 self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssign(std.id);
                        }}
                        disabled={isFull || isLoading}
                        className="px-3.5 py-2 rounded-xl bg-[#0080FF] hover:bg-[#0066CC] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-all shadow-md shadow-[#0080FF]/20 flex items-center gap-1.5"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Assigning...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Assign</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-400 truncate">
            {selectedStudent ? (
              <span>
                Selected: <strong className="text-white">{selectedStudent.name}</strong>
              </span>
            ) : (
              <span>Select a student from the list or click Assign directly.</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedStudent && (
              <button
                onClick={() => handleAssign(selectedStudent.id)}
                disabled={isFull || loadingUserId !== null}
                className="px-4 py-2 rounded-xl bg-[#0080FF] hover:bg-[#0066CC] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-all shadow-md shadow-[#0080FF]/20 flex items-center gap-1.5"
              >
                {loadingUserId === selectedStudent.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign Selected Student</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
