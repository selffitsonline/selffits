"use client";

import React, { useState } from "react";
import {
  Key,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react";
import {
  createCoachLoginAccountAction,
  resetCoachPasswordAction,
} from "@/actions/admin.actions";

interface CoachLoginAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: {
    id: string;
    fullName: string;
    email: string;
    hasLoginAccount?: boolean;
    loginEmail?: string | null;
  } | null;
  mode: "CREATE" | "RESET";
  onSuccess: (message: string, updatedCoachId: string, loginEmail: string) => void;
}

export function CoachLoginAccountModal({
  isOpen,
  onClose,
  coach,
  mode,
  onSuccess,
}: CoachLoginAccountModalProps) {
  if (!isOpen || !coach) return null;

  const [loginEmail, setLoginEmail] = useState(coach.loginEmail || coach.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === "CREATE" && !loginEmail.trim()) {
      setErrorMsg("Please enter a valid login email address.");
      return;
    }

    if (!password) {
      setErrorMsg("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "CREATE") {
        const res = await createCoachLoginAccountAction({
          coachId: coach.id,
          loginEmail: loginEmail.trim(),
          password,
          confirmPassword,
        });

        if (res.success) {
          onSuccess(res.message || "Coach login account created successfully.", coach.id, loginEmail.trim());
          onClose();
        } else {
          setErrorMsg(res.error || "Failed to create login account.");
        }
      } else {
        const res = await resetCoachPasswordAction({
          coachId: coach.id,
          newPassword: password,
          confirmPassword,
        });

        if (res.success) {
          onSuccess(res.message || "Coach password reset successfully.", coach.id, loginEmail.trim());
          onClose();
        } else {
          setErrorMsg(res.error || "Failed to reset password.");
        }
      }
    } catch (err: any) {
      console.error("Coach login modal error:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isCreate = mode === "CREATE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#14161D] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#10B981]/15 to-[#0080FF]/15 rounded-full blur-[80px] pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] flex items-center justify-center shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)]">
                {isCreate ? "Create Coach Login Account" : "Reset Coach Password"}
              </h2>
              <p className="text-xs text-gray-400">
                {isCreate
                  ? "Set up login credentials so this coach can access the Coach Dashboard."
                  : "Update login password credentials for this coach."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coach Summary Card */}
        <div className="relative z-10 p-4 rounded-2xl bg-[#0F1117] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Approved Coach
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-[10px] font-extrabold border border-[#10B981]/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> COACH ROLE
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E50914] to-[#0080FF] flex items-center justify-center font-bold text-white text-xs shrink-0">
              {coach.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-extrabold text-white truncate">{coach.fullName}</p>
              <p className="text-xs text-gray-400 truncate">{coach.email}</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="relative z-10 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          {/* Username / Login Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300">
              Username / Login Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                disabled={!isCreate || loading}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="coach@example.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#10B981] disabled:opacity-60 transition-all font-mono"
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[10px] text-gray-400">
              {isCreate
                ? "This will be the email the coach types at /login to access their Coach Dashboard."
                : "Active login email associated with this coach account."}
            </p>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300">
              {isCreate ? "Temporary Password" : "New Password"} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#10B981] transition-all font-mono"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-gray-400 hover:text-white absolute right-3 top-3 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300">
              Confirm Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#10B981] transition-all font-mono"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-1 text-gray-400 hover:text-white absolute right-3 top-3 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:opacity-95 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#10B981]/25 flex items-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isCreate ? (
                <>
                  <Key className="w-4 h-4" />
                  <span>Create Account &amp; Grant Access</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
