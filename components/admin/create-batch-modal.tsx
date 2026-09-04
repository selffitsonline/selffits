"use client";

import React, { useState, useEffect } from "react";
import { X, Layers, UserCheck, Calendar, Clock, AlertTriangle, BookOpen, Award, Video, ExternalLink } from "lucide-react";

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null; // If editing
  programs: { id: string; title: string; category: string }[];
  plans: { id: string; programId: string; name: string; levelName: string }[];
  coaches: { id: string; fullName: string; email: string; highestRank: string; disciplines: string }[];
  dayCombinations: string[];
  timeSlots: string[];
  onConfirm: (data: {
    name: string;
    programId: string;
    membershipPlanId?: string;
    coachId: string;
    dayCombination: string;
    timeSlot: string;
    meetingUrl?: string;
    maxCapacity: number;
  }) => Promise<void>;
}

export function CreateBatchModal({
  isOpen,
  onClose,
  initialData,
  programs,
  plans,
  coaches,
  dayCombinations,
  timeSlots,
  onConfirm,
}: CreateBatchModalProps) {
  const [name, setName] = useState("");
  const [programId, setProgramId] = useState("");
  const [membershipPlanId, setMembershipPlanId] = useState("");
  const [coachId, setCoachId] = useState("");
  const [dayCombination, setDayCombination] = useState(dayCombinations[0] || "Sunday & Wednesday");
  const [timeSlot, setTimeSlot] = useState(timeSlots[0] || "Morning");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(8);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setProgramId(initialData.programId || "");
      setMembershipPlanId(initialData.membershipPlanId || "");
      setCoachId(initialData.coachId || "");
      setDayCombination(initialData.dayCombination || dayCombinations[0] || "Sunday & Wednesday");
      setTimeSlot(initialData.timeSlot || timeSlots[0] || "Morning");
      setMeetingUrl(initialData.meetingUrl || "");
      setMaxCapacity(initialData.maxCapacity || 8);
    } else {
      setName("");
      setProgramId(programs[0]?.id || "");
      setMembershipPlanId("");
      setCoachId(coaches[0]?.id || "");
      setDayCombination(dayCombinations[0] || "Sunday & Wednesday");
      setTimeSlot(timeSlots[0] || "Morning");
      setMeetingUrl("");
      setMaxCapacity(8);
    }
    setErrorMsg("");
  }, [initialData, isOpen, programs, coaches, dayCombinations, timeSlots]);

  if (!isOpen) return null;

  // Filter plans available for selected program
  const availablePlans = plans.filter((p) => p.programId === programId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Batch name is required.");
      return;
    }
    if (!programId) {
      setErrorMsg("Please select a Program.");
      return;
    }
    if (!coachId) {
      setErrorMsg("Please select an Active Coach.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      await onConfirm({
        name: name.trim(),
        programId,
        membershipPlanId: membershipPlanId || undefined,
        coachId,
        dayCombination,
        timeSlot,
        meetingUrl: meetingUrl.trim() || undefined,
        maxCapacity: Number(maxCapacity) || 8,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save batch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#14161D] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 my-auto">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0080FF]/20 border border-[#0080FF]/30 text-[#0080FF] flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)]">
              {initialData ? "Edit Batch Details" : "Create New Batch"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Configure program category, assigned coach, day schedule, time slot, and student capacity limit.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Batch Name */}
          <div className="space-y-1">
            <label className="block font-bold text-gray-300 uppercase tracking-wider text-[10px]">
              Batch Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Kung Fu Beginners Morning Batch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF] transition-all"
              required
            />
          </div>

          {/* Program Select */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-gray-300 uppercase tracking-wider text-[10px]">
                Program / Category *
              </label>
              <select
                value={programId}
                onChange={(e) => {
                  setProgramId(e.target.value);
                  setMembershipPlanId("");
                }}
                className="w-full h-10 px-3 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#0080FF] cursor-pointer"
                required
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#14161D]">
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Level / Plan Select */}
            <div className="space-y-1">
              <label className="block font-bold text-gray-300 uppercase tracking-wider text-[10px]">
                Membership Plan Level (Optional)
              </label>
              <select
                value={membershipPlanId}
                onChange={(e) => setMembershipPlanId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#0080FF] cursor-pointer"
              >
                <option value="" className="bg-[#14161D]">
                  All Plan Levels
                </option>
                {availablePlans.map((plan) => (
                  <option key={plan.id} value={plan.id} className="bg-[#14161D]">
                    {plan.levelName || plan.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Coach Select */}
          <div className="space-y-1">
            <label className="block font-bold text-gray-300 uppercase tracking-wider text-[10px]">
              Assigned Active Coach *
            </label>
            <select
              value={coachId}
              onChange={(e) => setCoachId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#0080FF] cursor-pointer"
              required
            >
              {coaches.length === 0 ? (
                <option value="" className="bg-[#14161D]">
                  No active approved coaches available
                </option>
              ) : (
                coaches.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#14161D]">
                    {c.fullName} ({c.disciplines || c.highestRank})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Day Combinations */}
          <div className="space-y-1.5">
            <label className="block font-bold text-gray-300 uppercase tracking-wider text-[10px]">
              Select Day Combination *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {dayCombinations.map((dc) => {
                const isSelected = dayCombination === dc;
                return (
                  <button
                    key={dc}
                    type="button"
                    onClick={() => setDayCombination(dc)}
                    className={`p-2.5 rounded-xl border text-[11px] font-extrabold transition-all text-center ${
                      isSelected
                        ? "bg-[#0080FF]/20 border-[#0080FF] text-white shadow-md shadow-[#0080FF]/15"
                        : "bg-[#0F1117] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {dc}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Select */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-300 uppercase tracking-wider text-[10px]">
                Time Slot *
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {timeSlots.map((ts) => {
                  const isSelected = timeSlot === ts;
                  return (
                    <button
                      key={ts}
                      type="button"
                      onClick={() => setTimeSlot(ts)}
                      className={`p-2 rounded-xl border text-[11px] font-extrabold transition-all text-center ${
                        isSelected
                          ? "bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-500/15"
                          : "bg-[#0F1117] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {ts}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Max Capacity */}
            <div className="space-y-1">
              <label className="block font-bold text-gray-300 uppercase tracking-wider text-[10px]">
                Max Student Capacity (Default: 8) *
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#0080FF]"
                required
              />
            </div>
          </div>

          {/* Meeting Link Field */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[#0F1117] border border-white/10">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-gray-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-[#10B981]" /> Batch Meeting Link (Google Meet / Zoom URL)
              </label>
              {meetingUrl && (
                <button
                  type="button"
                  onClick={() => setMeetingUrl("")}
                  className="text-red-400 hover:underline text-[10px] font-bold"
                >
                  Clear Link
                </button>
              )}
            </div>
            <input
              type="url"
              placeholder="e.g. https://meet.google.com/xyz-abc-123"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-[#14161D] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#10B981] font-mono transition-all"
            />
            <p className="text-[10px] text-gray-400">
              When saved, this meeting link is automatically available to all students assigned to this batch.
            </p>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#0080FF] hover:bg-[#0066CC] text-white font-extrabold transition-all shadow-lg shadow-[#0080FF]/20"
            >
              {loading ? "Saving Batch..." : initialData ? "Update Batch" : "Create Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
