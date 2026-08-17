"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordSchema, ResetPasswordInput } from "@/types/validation.schemas";
import { resetPasswordAction } from "@/actions/auth.actions";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    const res = await resetPasswordAction({ ...data, token: token || data.token });

    if (!res.success) {
      setServerError(res.error || "Failed to reset password.");
      setIsLoading(false);
      return;
    }

    setSuccessMsg(res.message || "Password reset successfully!");
    setIsLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col items-center justify-center p-4">
        <div className="bg-[#14161D] border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-[#EF4444] mb-2">Invalid Token</h2>
          <p className="text-gray-400 text-sm mb-4">No password reset token was provided. Please request a new link.</p>
          <Link href="/forgot-password" className="px-6 py-2 bg-[#E50914] text-white font-bold rounded-lg text-sm">
            Request Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-[#E50914]/15 to-[#0080FF]/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#14161D] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center mb-6">
          <Link href="/">
            <Image
              src="/logo.jpg"
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
          <p className="text-sm text-gray-400 mt-1 text-center">
            Choose a strong new password for your account.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-3.5 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 text-[#EF4444] text-sm text-center">
            {serverError}
          </div>
        )}

        {successMsg ? (
          <div className="p-6 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-center">
            <h3 className="text-lg font-bold text-white mb-2">Password Reset Successful</h3>
            <p className="text-gray-300 text-sm mb-6">{successMsg}</p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 rounded-lg bg-[#E50914] text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Log In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" value={token} {...register("token")} />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full h-12 px-4 rounded-lg bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors"
              />
              {errors.password && (
                <p className="text-xs text-[#EF4444] mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className="w-full h-12 px-4 rounded-lg bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-[#EF4444] mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-lg bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-bold text-base hover:opacity-95 transition-opacity shadow-lg shadow-[#E50914]/20 cursor-pointer disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
