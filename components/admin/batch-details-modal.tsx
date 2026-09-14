"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Layers,
  UserCheck,
  Calendar,
  Clock,
  Users,
  Award,
  Trash2,
  UserPlus,
  Video,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { updateBatchAction } from "@/actions/batch.actions";

interface BatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: {
    id: string;
    batchId: string;
    name: string;
    programId: string;
    programTitle: string;
    programCategory: string;
    membershipPlanId: string | null;
    levelName: string;
    beltLevel?: string;
    coachId: string;
    coachName: string;
    coachEmail: string;
    coachPhone: string;
    coachRank: string;
    coachDisciplines: string;
    dayCombination: string;
    timeSlot: string;
    clockTiming: string;
    meetingUrl?: string | null;
    examDate?: string | null;
    examDateISO?: string | null;
    maxCapacity: number;
    studentCount: number;
    availableSeats: number;
    capacityLabel: string;
    status: string;
    createdAt: string;
    students: {
      id: string;
      batchStudentId: string;
      name: string;
      email: string;
      phone: string;
      programTitle: string;
      levelName: string;
      enrollmentStatus: string;
      joinedTimestamp: string;
      assignedAt: string;
    }[];
  } | null;
  onOpenAssignModal: (batch: any) => void;
  onRemoveStudent: (batchId: string, userId: string) => Promise<void>;
  onDeactivateBatch: (batchId: string, deletePermanently: boolean) => Promise<void>;
  onBatchUpdated?: (updatedFields: any) => void;
}

const BELT_OPTIONS = [
  "White Belt",
  "Yellow Belt",
  "Orange Belt",
  "Green Belt",
  "Blue Belt",
  "Purple Belt",
  "Brown Belt",
  "Black Belt",
];

export function BatchDetailsModal({
  isOpen,
  onClose,
  batch,
  onOpenAssignModal,
  onRemoveStudent,
  onDeactivateBatch,
  onBatchUpdated,
}: BatchDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "students">("overview");
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  // Editable Batch Details State
  const [meetingUrlInput, setMeetingUrlInput] = useState("");
  const [examDateInput, setExamDateInput] = useState("");
  const [beltLevelInput, setBeltLevelInput] = useState("White Belt");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Save Notification Alert
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Sync state when batch prop changes or opens (only when batch.id changes, not on field updates)
  const batchId = batch?.id;
  useEffect(() => {
    if (batch && isOpen) {
      setMeetingUrlInput(batch.meetingUrl || "");
      setExamDateInput(batch.examDateISO || "");
      setBeltLevelInput(batch.beltLevel || "White Belt");
      setNotification(null);
      setIsSavedSuccess(false);
    }
  }, [batchId, isOpen]);

  if (!isOpen || !batch) return null;

  const capacityPercent = Math.min(
    100,
    Math.round((batch.studentCount / (batch.maxCapacity || 8)) * 100)
  );

  // Input change wrappers that reset saved success state when user modifies inputs again
  const handleBeltChange = (val: string) => {
    setBeltLevelInput(val);
    if (isSavedSuccess) setIsSavedSuccess(false);
  };

  const handleMeetingUrlChange = (val: string) => {
    setMeetingUrlInput(val);
    if (isSavedSuccess) setIsSavedSuccess(false);
  };

  const handleExamDateChange = (val: string) => {
    setExamDateInput(val);
    if (isSavedSuccess) setIsSavedSuccess(false);
  };

  const todayISO = new Date().toISOString().split("T")[0];

  // Main Save Changes Handler
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setNotification(null);
    setIsSavedSuccess(false);

    if (examDateInput && examDateInput.trim() !== "") {
      if (examDateInput < todayISO) {
        setIsSaving(false);
        setNotification({
          message: "Scheduled examination date cannot be in the past. Please select today or a future date.",
          type: "error",
        });
        return;
      }
    }

    try {
      const res = await updateBatchAction(batch.id, {
        meetingUrl: meetingUrlInput.trim() || null,
        examDate: examDateInput.trim() || null,
        beltLevel: beltLevelInput,
      });

      setIsSaving(false);

      if (res.success) {
        setIsSavedSuccess(true);
        setTimeout(() => {
          setIsSavedSuccess(false);
        }, 5000);

        setNotification({
          message: "Batch details updated successfully.",
          type: "success",
        });

        // Auto-dismiss notification after 4 seconds
        setTimeout(() => {
          setNotification(null);
        }, 4000);

        let formattedExamDate: string | null = null;
        if (examDateInput.trim()) {
          const d = new Date(examDateInput.trim());
          if (!isNaN(d.getTime())) {
            formattedExamDate = d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          }
        }

        if (onBatchUpdated) {
          onBatchUpdated({
            id: batch.id,
            meetingUrl: meetingUrlInput.trim() || null,
            examDate: formattedExamDate,
            examDateISO: examDateInput.trim() || null,
            beltLevel: beltLevelInput,
          });
        }
      } else {
        setNotification({
          message: res.error || "Failed to save batch changes. Please try again.",
          type: "error",
        });
      }
    } catch (err: any) {
      console.error(err);
      setIsSaving(false);
      setNotification({
        message: err?.message || "Failed to save batch changes. An unexpected error occurred.",
        type: "error",
      });
    }
  };

  const handleRemoveStudent = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this student from the batch?")) return;
    setLoadingUserId(userId);
    try {
      await onRemoveStudent(batch.id, userId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleDeactivate = async (deletePermanently: boolean = false) => {
    const msg = deletePermanently
      ? "Are you sure you want to PERMANENTLY DELETE this batch? This action cannot be undone."
      : "Are you sure you want to set this batch to INACTIVE?";
    if (!confirm(msg)) return;

    setDeactivating(true);
    try {
      await onDeactivateBatch(batch.id, deletePermanently);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#14161D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 bg-[#0F1117] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0080FF] to-[#0055B3] flex items-center justify-center font-extrabold text-white text-xl shadow-lg shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-black text-white font-[family-name:var(--font-outfit)]">
                  {batch.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-gray-300 border border-white/10">
                  {batch.batchId}
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                    batch.status === "FULL"
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : batch.status === "ACTIVE"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-white/10 text-gray-400 border-white/10"
                  }`}
                >
                  {batch.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                <span>
                  Program: <span className="text-white font-semibold">{batch.programTitle}</span> •{" "}
                  <span className="text-amber-300 font-bold">🥋 {beltLevelInput || "Yellow Belt"}</span>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenAssignModal(batch)}
              disabled={batch.status === "FULL"}
              className="px-4 py-2 rounded-xl bg-[#0080FF] hover:bg-[#0066CC] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-extrabold transition-all shadow-md shadow-[#0080FF]/20 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Assign Student
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-white/10 bg-[#0F1117]/50 flex items-center gap-6 text-xs font-bold text-gray-400 shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-[#0080FF] text-white"
                : "border-transparent hover:text-gray-200"
            }`}
          >
            <Layers className="w-4 h-4" /> Batch Overview & Details
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "students"
                ? "border-[#0080FF] text-white"
                : "border-transparent hover:text-gray-200"
            }`}
          >
            <Users className="w-4 h-4" /> Assigned Students ({batch.studentCount} / {batch.maxCapacity})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Animated Toast Notification Alert Banner */}
          {notification && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
                notification.type === "success"
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10"
                  : "bg-red-500/15 border-red-500/40 text-red-300 shadow-lg shadow-red-500/10"
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs font-extrabold">
                {notification.type === "success" ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-xs text-gray-400 hover:text-white font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Belt Level & Program Configuration Block */}
              <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" /> Batch Belt Level Configuration
                  </h4>
                  <span className="text-[10px] text-gray-400 font-medium">Assigned Belt progression tier</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] text-gray-400 font-semibold mb-1">
                      Belt Level *
                    </label>
                    <select
                      value={beltLevelInput}
                      onChange={(e) => handleBeltChange(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#14161D] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#0080FF] cursor-pointer"
                    >
                      {BELT_OPTIONS.map((b) => (
                        <option key={b} value={b} className="bg-[#14161D]">
                          🥋 {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 font-semibold mb-1">
                      Program & Capacity
                    </label>
                    <div className="h-10 px-3.5 rounded-xl bg-[#14161D] border border-white/10 text-gray-300 font-semibold text-xs flex items-center justify-between">
                      <span className="text-white font-bold truncate">{batch.programTitle}</span>
                      <span className="text-emerald-400 font-bold shrink-0">{batch.capacityLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meeting Link Edit Block */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0F1815] to-[#14161D] border border-[#10B981]/30 space-y-3 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#10B981]/20 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center font-bold shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                        Batch Live Meeting Link
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        Enter Google Meet or Zoom URL for live training classes.
                      </p>
                    </div>
                  </div>

                  {meetingUrlInput && (
                    <a
                      href={meetingUrlInput}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 text-xs font-bold hover:bg-[#10B981]/30 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Video className="w-3.5 h-3.5" /> Test Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="pt-2 border-t border-white/10">
                  <input
                    type="url"
                    placeholder="Enter Google Meet or Zoom URL (e.g. https://meet.google.com/xyz-abc-123)"
                    value={meetingUrlInput}
                    onChange={(e) => handleMeetingUrlChange(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#10B981] font-mono"
                  />
                </div>
              </div>

              {/* Scheduled Exam Date Edit Block */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1B1425] to-[#14161D] border border-purple-500/30 space-y-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                      Batch Scheduled Examination Date
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Set the official evaluation exam date for students in this batch.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <input
                    type="date"
                    min={todayISO}
                    value={examDateInput}
                    onChange={(e) => handleExamDateChange(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-[#0F1117] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Schedule & Coach Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Schedule Card */}
                <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2.5 text-[#0080FF]">
                    <Calendar className="w-4 h-4" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                      Class Schedule
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-400 text-[11px]">Day Combination</p>
                      <p className="text-white font-bold text-sm">{batch.dayCombination}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px]">Time Slot</p>
                      <p className="text-emerald-400 font-bold text-xs">
                        {batch.timeSlot} ({batch.clockTiming})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assigned Coach Card */}
                <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2.5 text-emerald-400">
                    <UserCheck className="w-4 h-4" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                      Assigned Active Coach
                    </h4>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-white font-extrabold text-sm">{batch.coachName}</p>
                    <p className="text-[#0080FF] font-semibold text-xs">{batch.coachRank}</p>
                    <p className="text-gray-400 text-[11px]">Disciplines: {batch.coachDisciplines}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-[family-name:var(--font-outfit)]">
                  Assigned Students List
                </h4>
                <button
                  onClick={() => onOpenAssignModal(batch)}
                  disabled={batch.status === "FULL"}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0080FF] hover:bg-[#0066CC] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-all shadow-md shadow-[#0080FF]/20 flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Assign New Student
                </button>
              </div>

              {batch.students.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-[#0F1117] rounded-xl border border-white/5 space-y-2">
                  <Users className="w-8 h-8 text-gray-600 mx-auto opacity-40" />
                  <p className="font-bold text-gray-400 text-xs">No students assigned to this batch yet.</p>
                  <p className="text-[11px] text-gray-500">
                    Click "Assign Student" above to assign eligible enrolled students.
                  </p>
                </div>
              ) : (
                <div className="bg-[#0F1117] border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0A0C10] text-gray-400 font-extrabold uppercase border-b border-white/10">
                      <tr>
                        <th className="p-3">Student Profile</th>
                        <th className="p-3">Plan Level</th>
                        <th className="p-3">Joined Date & Time</th>
                        <th className="p-3">Assigned Date</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {batch.students.map((std) => {
                        const isRemoving = loadingUserId === std.id;
                        return (
                          <tr key={std.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-3">
                              <p className="font-bold text-white">{std.name}</p>
                              <p className="text-gray-400 text-[11px]">{std.email}</p>
                              {std.phone && std.phone !== "Not provided" && (
                                <p className="text-gray-500 text-[10px]">{std.phone}</p>
                              )}
                            </td>
                            <td className="p-3 text-[#10B981] font-extrabold">{std.levelName}</td>
                            <td className="p-3 text-gray-300 text-[11px]">{std.joinedTimestamp}</td>
                            <td className="p-3 text-gray-400 text-[11px]">{std.assignedAt}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleRemoveStudent(std.id)}
                                disabled={isRemoving}
                                className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold transition-all"
                              >
                                {isRemoving ? "Removing..." : "Remove"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Single-Row Sticky Footer Bar */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0F1117] flex items-center justify-between gap-4 shrink-0">
          {/* Left Actions: Deactivate & Delete Batch */}
          <div className="flex items-center gap-2.5">
            {batch.status !== "INACTIVE" && (
              <button
                type="button"
                onClick={() => handleDeactivate(false)}
                disabled={deactivating || isSaving}
                className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {deactivating ? "Deactivating..." : "Deactivate Batch"}
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDeactivate(true)}
              disabled={deactivating || isSaving}
              className="px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> {deactivating ? "Deleting..." : "Delete Batch"}
            </button>
          </div>

          {/* Right Action: Save Changes Button with Green Transition */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className={`px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 ${
                isSavedSuccess
                  ? "bg-[#10B981] hover:bg-emerald-600 text-white border border-emerald-400 shadow-emerald-500/40 ring-2 ring-emerald-400/50 scale-[1.02]"
                  : "bg-[#0080FF] hover:bg-[#0066CC] text-white shadow-[#0080FF]/30"
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : isSavedSuccess ? (
                <>
                  <CheckCircle2 className="w-4.5 h-4.5 text-white" /> Saved Successfully!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
