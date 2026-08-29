"use client";

import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, ShieldCheck, X } from "lucide-react";

interface BlockStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    name: string;
    email: string;
    isBlocked: boolean;
  } | null;
  onConfirm: (studentId: string, willBlock: boolean) => Promise<void>;
}

export function BlockStudentModal({ isOpen, onClose, student, onConfirm }: BlockStudentModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !student) return null;

  const willBlock = !student.isBlocked;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm(student.id, willBlock);
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
              willBlock ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {willBlock ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
              {willBlock ? "Block Student Account" : "Unblock Student Account"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Target: <span className="text-white font-semibold">{student.name}</span> ({student.email})
            </p>
          </div>
        </div>

        <div className="bg-[#0F1117] border border-white/5 rounded-xl p-4 space-y-2">
          {willBlock ? (
            <>
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Account Restriction Details:</span>
              </div>
              <ul className="text-[11px] text-gray-400 space-y-1 list-disc list-inside pl-1">
                <li>Prevents student from logging into the academy portal</li>
                <li>Restricts access to live class links, dashboard, and certificates</li>
                <li><span className="text-emerald-400 font-medium">Preserves</span> all payment history, past enrollments, and user records</li>
              </ul>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Restore Student Access:</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Unblocking this account will restore immediate portal access, allowing the student to log in, view live classes, and access active enrollments.
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
              willBlock
                ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/20"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
            }`}
          >
            {loading ? "Processing..." : willBlock ? "Yes, Block Account" : "Yes, Unblock Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
