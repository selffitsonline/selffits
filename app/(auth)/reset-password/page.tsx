"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordSchema, ResetPasswordInput } from "@/types/validation.schemas";
import { resetPasswordAction } from "@/actions/auth.actions";
import { Turnstile, TurnstileRef } from "@/components/ui/turnstile";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileRef | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMsg(null);

    const res = await resetPasswordAction({
      ...data,
      token: token || data.token,
      turnstileToken: turnstileToken || "",
    });

    if (!res.success) {
      setServerError(res.error || "Failed to reset password.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
      setIsLoading(false);
      return;
    }

    setSuccessMsg(
      res.message ||
        "Your password has been reset successfully! You can now log in with your new password."
    );
    setIsLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col items-center justify-center p-4">
        <div className="bg-[#14161D] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto mb-4 text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-white mb-2 font-[family-name:var(--font-outfit)]">
            Missing Reset Token
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">
            No valid password reset token was provided in the link. Please request a new recovery link.
          </p>
          <Link
            href="/forgot-password"
            className="w-full py-3 px-6 bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl hover:opacity-95 transition-all inline-flex items-center justify-center"
          >
            REQUEST NEW RESET LINK
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-[#E50914]/15 to-[#0080FF]/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#14161D] border border-white/10 rounded-2xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center mb-6">
          <Link href="/">
            <Image
              src="/logo-updated.jpg"
              alt="SELFFITS Logo"
              width={160}
              height={120}
              priority
              className="h-auto w-auto object-contain rounded-lg mb-2"
            />
          </Link>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] tracking-tight text-white mt-2">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 text-center">
            Choose a strong new password for your SELFFITS account.
          </p>
        </div>

        {serverError && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-[#EF4444] text-xs sm:text-sm text-center font-medium leading-relaxed">
            {serverError}
          </div>
        )}

        {successMsg ? (
          <div className="p-6 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] mx-auto text-xl font-bold">
              ✓
            </div>
            <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
              Password Reset Complete
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{successMsg}</p>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-all text-center inline-flex items-center justify-center gap-2"
              >
                LOG IN WITH NEW PASSWORD
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" value={token} {...register("token")} />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                New Password <span className="text-[#E50914]">*</span>
              </label>
              <input
                type="password"
                placeholder="At least 8 characters"
                {...register("password")}
                className={`w-full h-12 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                  errors.password ? "border-[#EF4444]" : "border-white/10 focus:border-[#E50914]"
                }`}
              />
              {errors.password && (
                <p className="text-xs text-[#EF4444] mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Confirm New Password <span className="text-[#E50914]">*</span>
              </label>
              <input
                type="password"
                placeholder="Re-enter new password"
                {...register("confirmPassword")}
                className={`w-full h-12 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                  errors.confirmPassword
                    ? "border-[#EF4444]"
                    : "border-white/10 focus:border-[#E50914]"
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-[#EF4444] mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Cloudflare Turnstile */}
            <Turnstile
              ref={turnstileRef}
              onVerify={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken("")}
              theme="dark"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:opacity-95 transition-opacity shadow-lg shadow-[#E50914]/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? "UPDATING PASSWORD..." : "UPDATE PASSWORD"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
