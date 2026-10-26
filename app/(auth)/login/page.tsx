"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginInput } from "@/types/validation.schemas";
import { preLoginCheckAction, resendVerificationEmailAction } from "@/actions/auth.actions";
import { Turnstile, TurnstileRef } from "@/components/ui/turnstile";
import { Mail, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const urlError = searchParams.get("error");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Turnstile state
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileRef | null>(null);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken("");
  }, []);

  // Resend state
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (urlError === "EMAIL_NOT_VERIFIED" || urlError === "UNVERIFIED_EMAIL") {
      setIsUnverified(true);
      setErrorMsg("Your email address is not verified yet. Please check your inbox or resend the verification link.");
    } else if (urlError === "BlockedAccount") {
      setErrorMsg("Your account has been blocked by an administrator. Please contact academy support.");
    }
  }, [urlError]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsUnverified(false);
    setResendMessage(null);

    // 1. Server-side Rate Limiting & Cloudflare Turnstile Pre-check
    const preCheck = await preLoginCheckAction(data.email, turnstileToken);
    if (!preCheck.success) {
      setErrorMsg(preCheck.error || "Security check failed. Please try again.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
      setIsLoading(false);
      return;
    }

    // 2. NextAuth Sign-In
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        if (
          res.error === "EMAIL_NOT_VERIFIED" ||
          res.error.includes("EMAIL_NOT_VERIFIED") ||
          res.error === "UNVERIFIED_EMAIL"
        ) {
          setIsUnverified(true);
          setUnverifiedEmail(data.email);
          setErrorMsg(
            "Your email address is not verified yet. Email verification is compulsory before accessing your student portal."
          );
        } else if (res.error.toLowerCase().includes("blocked")) {
          setErrorMsg("Your account has been blocked by an administrator. Please contact academy support.");
        } else {
          setErrorMsg("Invalid email or password. Please check your credentials and try again.");
        }
        turnstileRef.current?.reset();
        setTurnstileToken("");
        setIsLoading(false);
        return;
      }

      // Check session role for automatic role-based redirect
      const session = await getSession();
      const role = session?.user?.role;
      const emailLower = data.email.toLowerCase().trim();
      const isAdminEmail =
        emailLower === "admin@selffits.com" || emailLower === "superadmin@selffits.com";

      if (role === "ADMIN" || role === "SUPER_ADMIN" || isAdminEmail) {
        window.location.replace("/admin/dashboard");
      } else if (role === "COACH" || emailLower === "coach@selffits.com") {
        window.location.replace("/coach/dashboard");
      } else if (callbackUrl && !callbackUrl.startsWith("/admin")) {
        window.location.replace(callbackUrl);
      } else {
        window.location.replace("/dashboard");
      }
    } catch (err: any) {
      if (err?.message?.includes("NEXT_REDIRECT") || err?.digest?.includes("NEXT_REDIRECT")) {
        const session = await getSession();
        if (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") {
          window.location.replace("/admin/dashboard");
        } else if (session?.user?.role === "COACH") {
          window.location.replace("/coach/dashboard");
        } else {
          window.location.replace("/dashboard");
        }
        return;
      }
      console.error("[LOGIN] Sign in exception:", err);
      setErrorMsg("An unexpected login error occurred. Please try again.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const emailToUse = unverifiedEmail || getValues("email");
    if (!emailToUse || !emailToUse.includes("@")) {
      setErrorMsg("Please enter your email address in the field above to resend verification.");
      return;
    }

    setIsResending(true);
    setResendMessage(null);

    const res = await resendVerificationEmailAction({
      email: emailToUse,
      turnstileToken: turnstileToken || "",
    });

    if (res.success) {
      setResendMessage(res.message || "A new verification link has been sent to your email.");
    } else {
      setResendMessage(res.error || "Failed to resend verification email. Please try again later.");
    }

    setIsResending(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col items-center justify-center p-4 relative">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-[#E50914]/15 to-[#0080FF]/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#14161D] border border-white/10 rounded-2xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Logo */}
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
            Login
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 text-center">
            Welcome back! Please enter your credentials to log in.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-[#EF4444] text-xs sm:text-sm text-center font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Unverified Email Resend Notice */}
        {isUnverified && (
          <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center space-y-2.5">
            <p className="font-semibold text-amber-200">
              Haven&apos;t received your verification email or did the link expire?
            </p>
            {resendMessage ? (
              <p className="text-emerald-400 font-bold">{resendMessage}</p>
            ) : (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full py-2.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                {isResending ? "SENDING LINK..." : "RESEND VERIFICATION EMAIL"}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Email Address <span className="text-[#E50914]">*</span>
            </label>
            <input
              type="email"
              placeholder="student@example.com"
              {...register("email")}
              className={`w-full h-12 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                errors.email ? "border-[#EF4444]" : "border-white/10 focus:border-[#E50914]"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-[#EF4444] mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Password <span className="text-[#E50914]">*</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#0080FF] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className={`w-full h-12 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                errors.password ? "border-[#EF4444]" : "border-white/10 focus:border-[#E50914]"
              }`}
            />
            {errors.password && (
              <p className="text-xs text-[#EF4444] mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                {...register("rememberMe")}
                className="w-4 h-4 rounded border-gray-700 bg-[#0F1117] text-[#E50914] focus:ring-[#E50914]"
              />
              Remember me
            </label>
          </div>

          {/* Cloudflare Turnstile CAPTCHA */}
          <Turnstile
            ref={turnstileRef}
            onVerify={handleTurnstileVerify}
            onExpire={handleTurnstileExpire}
            theme="dark"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:opacity-95 transition-opacity shadow-lg shadow-[#E50914]/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? "SIGNING IN..." : "LOGIN"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#E50914] font-semibold hover:underline">
            Enroll / Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
