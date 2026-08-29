"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  onConfirm: (coachId: string) => Promise<void>;
}

export function DeleteCoachModal({
  isOpen,
  onClose,
  coach,
  onConfirm,
}: DeleteCoachModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");

  if (!isOpen || !coach) return null;

  const isConfirmed = confirmationInput.trim().toLowerCase() === "delete";

  const handleSubmit = async () => {
    if (!isConfirmed) return;
    setLoading(true);
    try {
      await onConfirm(coach.id);
      setConfirmationInput("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#14161D] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-5">
        <button
          onClick={() => {
            setConfirmationInput("");
            onClose();
          }}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
              Permanently Delete Coach Account
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Target: <span className="text-white font-semibold">{coach.fullName}</span> ({coach.email})
            </p>
          </div>
        </div>

        <div className="bg-[#0F1117] border border-red-500/20 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Permanent Deletion Warning:</span>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            This action will permanently remove this coach profile record from the system. This cannot be undone. Historical student class completions and financial transactions will remain safely retained for audit purposes.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider">
            Type <span className="text-red-400 font-mono">DELETE</span> to confirm permanent removal:
          </label>
          <input
            type="text"
            placeholder="Type DELETE"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setConfirmationInput("");
              onClose();
            }}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isConfirmed || loading}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-extrabold uppercase transition-all shadow-lg shadow-red-600/20"
          >
            {loading ? "Deleting..." : "Permanently Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
