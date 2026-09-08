"use client";

import React, { useState, useEffect } from "react";
import { X, Layers, UserCheck, Calendar, Clock, AlertTriangle, BookOpen, Award, Video } from "lucide-react";

const BELT_LEVEL_OPTIONS = [
  "Yellow Belt",
  "Orange Belt",
  "Green Belt",
  "Blue Belt",
  "Purple Belt",
  "Brown Belt",
  "Black Belt",
];

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null; // If editing
  programs: { id: string; title: string; category: string }[];
  plans?: { id: string; programId: string; name: string; levelName: string }[];
  coaches: { id: string; fullName: string; email: string; highestRank: string; disciplines: string }[];
  dayCombinations: string[];
  timeSlots: string[];
  onConfirm: (data: {
    name: string;
    programId: string;
    beltLevel: string;
    coachId: string;
    dayCombination: string;
    timeSlot: string;
    meetingUrl?: string;
    examDate?: string;
    maxCapacity: number;
  }) => Promise<void>;
}

export function CreateBatchModal({
  isOpen,
  onClose,
  initialData,
  programs,
  coaches,
  dayCombinations,
  timeSlots,
  onConfirm,
}: CreateBatchModalProps) {
  const [name, setName] = useState("");
  const [programId, setProgramId] = useState("");
  const [beltLevel, setBeltLevel] = useState("Yellow Belt");
  const [coachId, setCoachId] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
  ]);
  const [timeSlot, setTimeSlot] = useState(timeSlots[0] || "1st Batch");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [examDate, setExamDate] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(8);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const parseDayCombinationToDays = (dcStr: string): string[] => {
    if (!dcStr) return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    if (dcStr.includes("Monday to Friday")) return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    if (dcStr.includes("Tuesday to Saturday")) return ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (dcStr.includes("Sunday to Thursday")) return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    if (dcStr.includes("Mon, Wed, Fri")) return ["Monday", "Wednesday", "Friday"];
    if (dcStr.includes("Tue, Thu, Sat")) return ["Tuesday", "Thursday", "Saturday"];
    if (dcStr.includes("Sunday & Wednesday")) return ["Sunday", "Wednesday"];
    if (dcStr.includes("Monday & Thursday")) return ["Monday", "Thursday"];
    if (dcStr.includes("Saturday & Tuesday")) return ["Saturday", "Tuesday"];

    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const found = weekDays.filter((d) => dcStr.toLowerCase().includes(d.toLowerCase()) || dcStr.toLowerCase().includes(d.slice(0, 3).toLowerCase()));
    return found.length > 0 ? found : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  };

  const getComputedScheduleName = (days: string[]): string => {
    if (days.length === 0) return "Select at least 1 training day";
    const joined = days.join(",");
    if (days.length === 5 && joined === "Monday,Tuesday,Wednesday,Thursday,Friday") {
      return "5 Days / Week (Monday to Friday)";
    }
    if (days.length === 5 && joined === "Tuesday,Wednesday,Thursday,Friday,Saturday") {
      return "5 Days / Week (Tuesday to Saturday)";
    }
    if (days.length === 5 && joined === "Sunday,Monday,Tuesday,Wednesday,Thursday") {
      return "5 Days / Week (Sunday to Thursday)";
    }
    if (days.length === 3 && joined === "Monday,Wednesday,Friday") {
      return "3 Days / Week (Mon, Wed, Fri)";
    }
    if (days.length === 3 && joined === "Tuesday,Thursday,Saturday") {
      return "3 Days / Week (Tue, Thu, Sat)";
    }
    if (days.length === 2 && (joined === "Sunday,Wednesday" || joined === "Wednesday,Sunday")) {
      return "Sunday & Wednesday";
    }
    if (days.length === 2 && (joined === "Saturday,Sunday" || joined === "Sunday,Saturday")) {
      return "2 Days / Week (Sat, Sun)";
    }
    const shortNames = days.map((d) => d.slice(0, 3)).join(", ");
    return `${days.length} Days / Week (${shortNames})`;
  };

  const computedDayCombination = getComputedScheduleName(selectedDays);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setProgramId(initialData.programId || "");
      setBeltLevel(initialData.beltLevel || "Yellow Belt");
      setCoachId(initialData.coachId || "");
      setSelectedDays(parseDayCombinationToDays(initialData.dayCombination));
      setTimeSlot(initialData.timeSlot || timeSlots[0] || "1st Batch");
      setMeetingUrl(initialData.meetingUrl || "");
      setExamDate(initialData.examDateISO || "");
      setMaxCapacity(initialData.maxCapacity || 8);
    } else {
      setName("");
      setProgramId(programs[0]?.id || "");
      setBeltLevel("Yellow Belt");
      setCoachId(coaches[0]?.id || "");
      setSelectedDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
      setTimeSlot(timeSlots[0] || "1st Batch");
      setMeetingUrl("");
      setExamDate("");
      setMaxCapacity(8);
    }
    setErrorMsg("");
  }, [initialData, isOpen, programs, coaches, dayCombinations, timeSlots]);

  if (!isOpen) return null;

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
    if (!beltLevel) {
      setErrorMsg("Please select a Belt Level.");
      return;
    }
    if (!coachId) {
      setErrorMsg("Please select an Active Coach.");
      return;
    }
    const todayISO = new Date().toISOString().split("T")[0];
    if (examDate && examDate.trim() !== "") {
      if (examDate < todayISO) {
        setErrorMsg("Scheduled examination date cannot be in the past. Please select today or a future date.");
        return;
      }
    }

    setLoading(true);
    setErrorMsg("");
    try {
      await onConfirm({
        name: name.trim(),
        programId,
        beltLevel,
        coachId,
        dayCombination: computedDayCombination,
        timeSlot,
        meetingUrl: meetingUrl.trim() || undefined,
        examDate: examDate ? examDate : undefined,
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
              Configure program category, assigned belt level, coach, schedule, and student capacity.
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
              placeholder="e.g. Yellow Belt Beginners Batch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#0080FF] transition-all"
              required
            />
          </div>

          {/* Program & Belt Level Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-gray-300 uppercase tracking-wider text-[10px]">
                Program / Category *
              </label>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
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

            {/* REQUIRED BELT LEVEL SELECT */}
            <div className="space-y-1">
              <label className="block font-bold text-[#0080FF] uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> BELT LEVEL *
              </label>
              <select
                value={beltLevel}
                onChange={(e) => setBeltLevel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#0F1117] border-2 border-[#0080FF]/60 text-white text-xs font-extrabold focus:outline-none focus:border-[#0080FF] cursor-pointer"
                required
              >
                {BELT_LEVEL_OPTIONS.map((belt) => (
                  <option key={belt} value={belt} className="bg-[#14161D]">
                    {belt}
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

          {/* Training Schedule & Days Selection */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#0F1117] border border-white/10">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-gray-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0080FF]" /> Select Training Days (Tick Days) *
              </label>
              <span className="text-[10px] font-black text-[#0080FF] bg-[#0080FF]/15 px-2 py-0.5 rounded-md border border-[#0080FF]/30">
                {selectedDays.length} Days Selected
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mr-1">Presets:</span>
              <button
                type="button"
                onClick={() => setSelectedDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer ${
                  selectedDays.join(",") === "Monday,Tuesday,Wednesday,Thursday,Friday"
                    ? "bg-[#0080FF] text-white border-[#0080FF] shadow-sm"
                    : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"
                }`}
              >
                5 Days (Mon–Fri)
              </button>
              <button
                type="button"
                onClick={() => setSelectedDays(["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer ${
                  selectedDays.join(",") === "Tuesday,Wednesday,Thursday,Friday,Saturday"
                    ? "bg-[#0080FF] text-white border-[#0080FF] shadow-sm"
                    : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"
                }`}
              >
                5 Days (Tue–Sat)
              </button>
              <button
                type="button"
                onClick={() => setSelectedDays(["Monday", "Wednesday", "Friday"])}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer ${
                  selectedDays.join(",") === "Monday,Wednesday,Friday"
                    ? "bg-[#0080FF] text-white border-[#0080FF] shadow-sm"
                    : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"
                }`}
              >
                3 Days (MWF)
              </button>
              <button
                type="button"
                onClick={() => setSelectedDays(["Saturday", "Sunday"])}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer ${
                  selectedDays.join(",") === "Saturday,Sunday" || selectedDays.join(",") === "Sunday,Saturday"
                    ? "bg-[#0080FF] text-white border-[#0080FF] shadow-sm"
                    : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"
                }`}
              >
                2 Days (Sat–Sun)
              </button>
            </div>

            {/* 7 Interactive Tickable Day Pills */}
            <div className="grid grid-cols-7 gap-1.5 pt-1.5">
              {[
                { full: "Sunday", short: "Sun" },
                { full: "Monday", short: "Mon" },
                { full: "Tuesday", short: "Tue" },
                { full: "Wednesday", short: "Wed" },
                { full: "Thursday", short: "Thu" },
                { full: "Friday", short: "Fri" },
                { full: "Saturday", short: "Sat" },
              ].map((day) => {
                const isSelected = selectedDays.includes(day.full);
                return (
                  <button
                    key={day.full}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDays(selectedDays.filter((d) => d !== day.full));
                      } else {
                        const weekOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        const next = [...selectedDays, day.full].sort(
                          (a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b)
                        );
                        setSelectedDays(next);
                      }
                    }}
                    className={`py-2 rounded-xl border text-[11px] font-extrabold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-[#0080FF] text-white border-[#0080FF] shadow-md shadow-[#0080FF]/25 ring-2 ring-[#0080FF]/30"
                        : "bg-[#14161D] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span>{day.short}</span>
                    {isSelected ? (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Summary Label */}
            <p className="text-[10px] text-gray-400 pt-1 font-mono">
              Schedule Summary: <span className="text-white font-bold">{computedDayCombination}</span>
            </p>
          </div>

          {/* Time Slot Select & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-gray-300 uppercase tracking-wider text-[10px]">
                Time Slot & Batch Timing *
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#0F1117] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#0080FF] cursor-pointer"
                required
              >
                {timeSlots.map((ts) => (
                  <option key={ts} value={ts} className="bg-[#14161D]">
                    {ts}
                  </option>
                ))}
              </select>
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
          </div>

          {/* Batch Examination Date Field */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[#0F1117] border border-white/10">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-purple-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> BATCH EXAM DATE (OPTIONAL SCHEDULE)
              </label>
              {examDate && (
                <button
                  type="button"
                  onClick={() => setExamDate("")}
                  className="text-red-400 hover:underline text-[10px] font-bold"
                >
                  Remove Exam Date
                </button>
              )}
            </div>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-[#14161D] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
            />
            <p className="text-[10px] text-gray-400">
              Schedule or announce a specific examination date for this batch.
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
