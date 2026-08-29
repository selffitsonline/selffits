"use client";

import React, { useState } from "react";
import { X, UserPlus, Search, CheckCircle2, AlertTriangle, UserCheck } from "lucide-react";

interface AssignStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: {
    id: string;
    batchId: string;
    name: string;
    programId: string;
    programTitle: string;
    levelName: string;
    maxCapacity: number;
    studentCount: number;
    status: string;
    students: { id: string }[];
  } | null;
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
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !batch) return null;

  const currentAssignedUserIds = batch.students.map((s) => s.id);
  const isFull = batch.studentCount >= batch.maxCapacity;

  // Filter students who are enrolled in the SAME program as the batch and not already assigned
  const eligibleStudents = allStudents.filter((std) => {
    // Must have active enrollment in batch program
    if (!std.isEnrolled || std.activeProgramId !== batch.programId) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const matchName = std.name.toLowerCase().includes(q);
      const matchEmail = std.email.toLowerCase().includes(q);
      const matchPhone = std.phone.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  const handleAssign = async (userId: string) => {
    if (isFull) {
      setErrorMsg(`Batch "${batch.name}" is FULL (${batch.studentCount}/${batch.maxCapacity}). Cannot assign more students.`);
      return;
    }
    setLoadingUserId(userId);
    setErrorMsg("");
    try {
      await onConfirmAssign(batch.id, userId);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to assign student.");
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#14161D] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 my-auto max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)]">
              Assign Students to Batch
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Batch: <span className="text-white font-semibold">{batch.name}</span> ({batch.programTitle} • {batch.levelName})
            </p>
          </div>
        </div>

        {/* Capacity Banner */}
        <div className="p-3.5 rounded-xl bg-[#0F1117] border border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-semibold">Capacity Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-black border ${
              isFull
                ? "bg-red-500/20 text-red-400 border-red-500/30"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            }`}
          >
            {batch.studentCount} / {batch.maxCapacity} Seats Filled {isFull ? "(FULL)" : ""}
          </span>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search eligible student by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF]"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
        </div>

        {/* Student List */}
        <div className="overflow-y-auto space-y-2 flex-1 max-h-60 pr-1">
          {eligibleStudents.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-[#0F1117] rounded-xl border border-white/5 space-y-2">
              <UserCheck className="w-8 h-8 text-gray-600 mx-auto opacity-40" />
              <p className="font-bold text-gray-400 text-xs">No eligible unassigned students found.</p>
              <p className="text-[11px] text-gray-500">
                Only students with an active enrollment in <span className="text-white font-medium">{batch.programTitle}</span> can be assigned to this batch.
              </p>
            </div>
          ) : (
            eligibleStudents.map((std) => {
              const isAlreadyAssigned = currentAssignedUserIds.includes(std.id);
              const isLoading = loadingUserId === std.id;

              return (
                <div
                  key={std.id}
                  className="p-3 rounded-xl bg-[#0F1117] border border-white/5 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                >
                  <div>
                    <p className="font-bold text-white text-xs">{std.name}</p>
                    <p className="text-[11px] text-gray-400">{std.email} • {std.phone}</p>
                    <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                      Enrolled: {std.activeProgramTitle} ({std.activeLevelName})
                    </p>
                  </div>

                  {isAlreadyAssigned ? (
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 text-gray-400 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Assigned
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAssign(std.id)}
                      disabled={isFull || isLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0080FF] hover:bg-[#0066CC] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-all shadow-md shadow-[#0080FF]/20 flex items-center gap-1"
                    >
                      {isLoading ? "Assigning..." : "Assign Student"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
