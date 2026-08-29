"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginInput } from "@/types/validation.schemas";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
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

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        if (res.error === "UNVERIFIED_EMAIL") {
          setErrorMsg("Your email is not verified yet. Please check your email inbox to verify your account.");
        } else {
          setErrorMsg("Invalid email or password. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Force immediate full browser location replace to target dashboard/callbackUrl
      window.location.replace(callbackUrl);
    } catch (err: any) {
      // In NextAuth v5, NEXT_REDIRECT exception is thrown on successful auth redirect
      if (err?.message?.includes("NEXT_REDIRECT") || err?.digest?.includes("NEXT_REDIRECT")) {
        window.location.replace(callbackUrl);
        return;
      }
      console.error("Login onSubmit error:", err);
      window.location.replace(callbackUrl);
    }
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
          <p className="text-sm text-gray-400 mt-1 text-center">
            Welcome back! Please enter your credentials to log in.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 text-[#EF4444] text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="student@example.com"
              {...register("email")}
              className="w-full h-12 px-4 rounded-lg bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors"
            />
            {errors.email && (
              <p className="text-xs text-[#EF4444] mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Password
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
              className="w-full h-12 px-4 rounded-lg bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors"
            />
            {errors.password && (
              <p className="text-xs text-[#EF4444] mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                {...register("rememberMe")}
                className="w-4 h-4 rounded border-gray-700 bg-[#0F1117] text-[#E50914] focus:ring-[#E50914]"
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-lg bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-bold text-base hover:opacity-95 transition-opacity shadow-lg shadow-[#E50914]/20 cursor-pointer disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#E50914] font-semibold hover:underline">
            Enroll / Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
