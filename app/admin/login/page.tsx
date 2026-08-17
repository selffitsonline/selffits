"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginInput } from "@/types/validation.schemas";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";
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
      });

      if (res?.error) {
        setErrorMsg("Invalid administrator credentials.");
        setIsLoading(false);
        return;
      }

      // Verify the role of the authenticated session
      const session = await getSession();
      if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
        setErrorMsg("Access Denied: Only Administrator and Super Admin accounts can access this portal.");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected system error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col items-center justify-center p-4 relative">
      {/* Background Glow Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-tr from-[#E50914]/20 to-[#0080FF]/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#14161D] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        {/* Logo */}
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
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#0080FF]/20 text-[#0080FF] border border-[#0080FF]/30 mb-2">
            Administrator Portal
          </span>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] tracking-tight text-white">
            Admin Authentication
          </h1>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 text-[#EF4444] text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@selffits.com"
              {...register("email")}
              className="w-full h-12 px-4 rounded-lg bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#0080FF] focus:ring-1 focus:ring-[#0080FF] transition-colors"
            />
            {errors.email && (
              <p className="text-xs text-[#EF4444] mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full h-12 px-4 rounded-lg bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#0080FF] focus:ring-1 focus:ring-[#0080FF] transition-colors"
            />
            {errors.password && (
              <p className="text-xs text-[#EF4444] mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-lg bg-gradient-to-r from-[#0080FF] to-[#2563EB] text-white font-bold text-base hover:opacity-95 transition-opacity shadow-lg shadow-[#0080FF]/20 cursor-pointer disabled:opacity-50 flex items-center justify-center mt-2"
          >
            {isLoading ? "Authenticating Admin..." : "Login to Control Panel"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          SELFFITS Security Notice: Unauthorized access attempts are monitored and logged.
        </div>
      </div>
    </div>
  );
}
