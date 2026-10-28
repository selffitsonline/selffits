"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  RotateCcw,
  X,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Info,
  Lock,
} from "lucide-react";

interface ReleaseEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    name: string;
    email: string;
  } | null;
  onConfirm: (
    studentId: string,
    confirmedEmail: string,
    reason: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export function ReleaseEmailModal({
  isOpen,
  onClose,
  student,
  onConfirm,
}: ReleaseEmailModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmationEmail("");
      setReason("");
      setErrorMessage(null);
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const targetEmail = student.email || "";
  const isEmailMatched =
    targetEmail.length > 0 &&
    confirmationEmail.trim().toLowerCase() === targetEmail.trim().toLowerCase();
  const isReasonValid = reason.trim().length >= 5;
  const canSubmit = isEmailMatched && isReasonValid && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await onConfirm(student.id, confirmationEmail.trim(), reason.trim());
      if (res.success) {
        setConfirmationEmail("");
        setReason("");
        onClose();
      } else {
        setErrorMessage(res.error || "Failed to release student email address.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setConfirmationEmail("");
    setReason("");
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#14161D] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-40"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                Release Student Email Address
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Super Admin Only
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Target Student: <span className="text-white font-semibold">{student.name}</span>
            </p>
            <p className="text-[11px] text-gray-400 font-mono">
              Account ID: {student.id}
            </p>
          </div>
        </div>

        {/* Explanatory Safety Notice */}
        <div className="bg-[#0F1117] border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Controlled Email Release Safeguards:</span>
          </div>

          <ul className="text-[11px] text-gray-300 space-y-2 list-disc list-inside pl-1 leading-relaxed">
            <li>
              <span className="text-amber-300 font-bold">Frees Email for Re-Registration:</span> Releases{" "}
              <span className="font-mono text-white underline">{targetEmail}</span> immediately so the user can register afresh through the website or mobile app without receiving a &quot;User Already Exists&quot; error.
            </li>
            <li>
              <span className="text-emerald-400 font-bold">Historical Records Preserved:</span> All payment transactions, Razorpay order IDs, active or expired enrollments, attendance records, and certificates remain permanently intact under the existing account record.
            </li>
            <li>
              <span className="text-red-400 font-bold">Old Access Deactivated:</span> The previous account password is removed, the account is blocked, and outstanding verification/reset tokens are deleted to prevent old login sessions.
            </li>
          </ul>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in duration-150">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Confirmation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Email Confirmation Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                Confirm Student Email to Proceed:
              </label>
              {isEmailMatched ? (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Email Matched
                </span>
              ) : (
                <span className="text-[10px] text-gray-500">Case-insensitive match</span>
              )}
            </div>
            <input
              type="text"
              placeholder={`Type "${targetEmail}"`}
              value={confirmationEmail}
              onChange={(e) => setConfirmationEmail(e.target.value)}
              disabled={loading}
              className={`w-full h-10 px-3.5 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 text-xs font-mono focus:outline-none transition-colors ${
                isEmailMatched
                  ? "border-emerald-500/60 focus:border-emerald-400"
                  : confirmationEmail.length > 0
                  ? "border-amber-500/60 focus:border-amber-400"
                  : "border-white/10 focus:border-amber-500"
              }`}
            />
            <p className="text-[10px] text-gray-500">
              Must exactly match: <span className="font-mono text-gray-300">{targetEmail}</span>
            </p>
          </div>

          {/* Administrative Reason Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                Administrative Reason (Required):
              </label>
              <span className={`text-[10px] ${isReasonValid ? "text-emerald-400 font-bold" : "text-gray-500"}`}>
                {reason.trim().length} / 5 min chars
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="e.g., Student requested fresh registration onboarding / Account email reset for re-enrollment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              className="w-full p-3 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 resize-none transition-colors"
            />
            <p className="text-[10px] text-gray-500 flex items-center gap-1">
              <Info className="w-3 h-3 text-gray-400 shrink-0" />
              Reason is captured in secure administrative audit logs with masked PII.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-xs font-bold transition-all disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-extrabold shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Releasing Email...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Release Email Address
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

