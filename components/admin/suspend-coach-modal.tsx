"use client";

import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, ShieldCheck, X } from "lucide-react";

interface SuspendCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: {
    id: string;
    fullName: string;
    email: string;
    isSuspended: boolean;
  } | null;
  onConfirm: (coachId: string, willSuspend: boolean) => Promise<void>;
}

export function SuspendCoachModal({
  isOpen,
  onClose,
  coach,
  onConfirm,
}: SuspendCoachModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !coach) return null;

  const willSuspend = !coach.isSuspended;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm(coach.id, willSuspend);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#14161D] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              willSuspend
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {willSuspend ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
              {willSuspend ? "Suspend Coach Account" : "Reactivate Coach Account"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Coach: <span className="text-white font-semibold">{coach.fullName}</span> ({coach.email})
            </p>
          </div>
        </div>

        <div className="bg-[#0F1117] border border-white/5 rounded-xl p-4 space-y-2">
          {willSuspend ? (
            <>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Temporary Suspension Details:</span>
              </div>
              <ul className="text-[11px] text-gray-400 space-y-1 list-disc list-inside pl-1">
                <li>Temporarily revokes access to live virtual class hosting</li>
                <li>Coach profile is marked as Suspended in Academy records</li>
                <li><span className="text-emerald-400 font-medium">Preserves</span> all teaching history, student feedback, and historical records</li>
                <li>Can be reactivated at any time by an Admin</li>
              </ul>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Reactivate Coach Access:</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Reactivating this coach account will immediately restore active coaching privileges, allowing the coach to host live virtual training sessions.
              </p>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase transition-all shadow-lg ${
              willSuspend
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
            }`}
          >
            {loading ? "Processing..." : willSuspend ? "Yes, Suspend Coach" : "Yes, Reactivate Coach"}
          </button>
        </div>
      </div>
    </div>
  );
}
