"use client";

import React, { useState } from "react";
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
  Mail,
  Phone,
  ShieldCheck,
  Video,
  ExternalLink,
  Edit,
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
}

export function BatchDetailsModal({
  isOpen,
  onClose,
  batch,
  onOpenAssignModal,
  onRemoveStudent,
  onDeactivateBatch,
}: BatchDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "students">("overview");
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [isEditingMeetingLink, setIsEditingMeetingLink] = useState(false);
  const [meetingUrlInput, setMeetingUrlInput] = useState("");
  const [isSavingLink, setIsSavingLink] = useState(false);

  if (!isOpen || !batch) return null;

  const capacityPercent = Math.min(
    100,
    Math.round((batch.studentCount / (batch.maxCapacity || 8)) * 100)
  );

  const handleSaveMeetingLink = async (newUrl: string | null) => {
    setIsSavingLink(true);
    try {
      const res = await updateBatchAction(batch.id, { meetingUrl: newUrl });
      if (res.success) {
        setIsEditingMeetingLink(false);
        window.location.reload();
      } else {
        alert(res.error || "Failed to update meeting link.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingLink(false);
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
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-[#0F1117] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                  Program: <span className="text-white font-semibold">{batch.programTitle}</span> ({batch.levelName})
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
        <div className="px-6 border-b border-white/10 bg-[#0F1117]/50 flex items-center gap-6 text-xs font-bold text-gray-400">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-[#0080FF] text-white"
                : "border-transparent hover:text-gray-200"
            }`}
          >
            <Layers className="w-4 h-4" /> Batch Overview & Schedule
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
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Meeting Link Banner / Control Block */}
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
                        Automatically available to all {batch.studentCount} student(s) assigned to this batch.
                      </p>
                    </div>
                  </div>

                  {batch.meetingUrl && !isEditingMeetingLink && (
                    <a
                      href={batch.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-black text-xs hover:opacity-95 transition-opacity shadow-md shadow-[#10B981]/20 flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      <Video className="w-4 h-4 fill-current" />
                      Join Meet
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {!isEditingMeetingLink ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                    <div className="font-mono text-xs text-white truncate max-w-md">
                      {batch.meetingUrl ? (
                        <span className="text-[#10B981] font-semibold">{batch.meetingUrl}</span>
                      ) : (
                        <span className="text-gray-500 italic">No meeting link configured for this batch yet.</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setMeetingUrlInput(batch.meetingUrl || "");
                          setIsEditingMeetingLink(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#0080FF]" /> {batch.meetingUrl ? "Edit / Replace Link" : "+ Add Meeting Link"}
                      </button>

                      {batch.meetingUrl && (
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to remove this meeting link from the batch?")) {
                              handleSaveMeetingLink(null);
                            }
                          }}
                          disabled={isSavingLink}
                          className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
                        >
                          Remove Link
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Enter Google Meet or Zoom URL (e.g. https://meet.google.com/xyz-abc-123)"
                        value={meetingUrlInput}
                        onChange={(e) => setMeetingUrlInput(e.target.value)}
                        className="flex-grow h-10 px-3.5 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#10B981] font-mono"
                      />
                      <button
                        onClick={() => handleSaveMeetingLink(meetingUrlInput.trim() || null)}
                        disabled={isSavingLink}
                        className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-black font-extrabold text-xs transition-all cursor-pointer shrink-0"
                      >
                        {isSavingLink ? "Saving..." : "Save Link"}
                      </button>
                      <button
                        onClick={() => setIsEditingMeetingLink(false)}
                        disabled={isSavingLink}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-bold transition-all cursor-pointer shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Capacity Progress Banner */}
              <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300">
                    Maximum Capacity & Enrollment Progress
                  </span>
                  <span className="text-sm font-black text-[#0080FF]">
                    {batch.studentCount} / {batch.maxCapacity} Students ({capacityPercent}%)
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      capacityPercent >= 100
                        ? "bg-red-500"
                        : "bg-gradient-to-r from-[#0080FF] to-[#10B981]"
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>

                <p className="text-[11px] text-gray-400">
                  {batch.availableSeats > 0
                    ? `${batch.availableSeats} available seat(s) remaining in this batch.`
                    : "This batch is currently FULL. No additional seats available."}
                </p>
              </div>

              {/* Schedule Details Grid */}
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
                      <p className="text-emerald-400 font-bold text-xs">{batch.timeSlot} ({batch.clockTiming})</p>
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
                    <p className="text-gray-400 text-[11px]">Email: {batch.coachEmail}</p>
                  </div>
                </div>
              </div>

              {/* Management Controls */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-white text-xs">Batch Management Actions</h5>
                  <p className="text-[11px] text-gray-400">Deactivate batch status or permanently delete record.</p>
                </div>
                <div className="flex items-center gap-3">
                  {batch.status !== "INACTIVE" && (
                    <button
                      onClick={() => handleDeactivate(false)}
                      disabled={deactivating}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-all"
                    >
                      Deactivate Batch
                    </button>
                  )}
                  <button
                    onClick={() => handleDeactivate(true)}
                    disabled={deactivating}
                    className="px-3.5 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500/30 transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Batch
                  </button>
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
      </div>
    </div>
  );
}
