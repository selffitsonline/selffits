"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordSchema, ForgotPasswordInput } from "@/types/validation.schemas";
import { forgotPasswordAction } from "@/actions/auth.actions";
import { Turnstile, TurnstileRef } from "@/components/ui/turnstile";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileRef | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setStatusMsg(null);
    setServerError(null);

    const res = await forgotPasswordAction({
      ...data,
      turnstileToken: turnstileToken || "",
    });

    if (!res.success) {
      setServerError(res.error || "Failed to process request. Please try again.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
      setIsLoading(false);
      return;
    }

    setStatusMsg(
      res.message ||
        "If an account exists with that email address, a password reset link has been dispatched."
    );
    setIsLoading(false);
  };

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
            Forgot Password?
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 text-center">
            Enter your registered email address to receive a secure password recovery link.
          </p>
        </div>

        {serverError && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-[#EF4444] text-xs sm:text-sm text-center font-medium leading-relaxed">
            {serverError}
          </div>
        )}

        {statusMsg ? (
          <div className="p-6 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] mx-auto text-xl font-bold">
              ✓
            </div>
            <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">{statusMsg}</p>
            <p className="text-amber-400 text-xs font-semibold">
              ⏳ Password reset links remain valid for 1 hour.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-all text-center inline-flex items-center justify-center gap-2"
              >
                RETURN TO LOGIN
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Email Address <span className="text-[#E50914]">*</span>
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                {...register("email")}
                className={`w-full h-12 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                  errors.email ? "border-[#EF4444]" : "border-white/10 focus:border-[#E50914]"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-[#EF4444] mt-1">{errors.email.message}</p>
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
              {isLoading ? "SENDING RECOVERY LINK..." : "SEND RECOVERY LINK"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          Remembered your password?{" "}
          <Link href="/login" className="text-[#E50914] font-semibold hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
