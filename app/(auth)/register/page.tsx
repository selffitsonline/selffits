"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, RegisterInput } from "@/types/validation.schemas";
import { registerStudentAction } from "@/actions/auth.actions";

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMsg(null);

    const res = await registerStudentAction(data);

    if (!res.success) {
      if (res.fieldErrors) {
        Object.entries(res.fieldErrors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            setError(field as keyof RegisterInput, {
              type: "server",
              message: messages[0],
            });
          }
        });
      }
      setServerError(res.error || "Failed to create account. Please try again.");
      setIsLoading(false);
      return;
    }

    setSuccessMsg(res.message || "Account registered successfully! Please check your email to verify.");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col items-center justify-center p-4 py-12 relative">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#E50914]/15 to-[#0080FF]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl bg-[#14161D] border border-white/10 rounded-2xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Logo Header */}
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
            Student Registration
          </h1>
          <p className="text-sm text-gray-400 mt-1 text-center">
            Create your account to enroll in live Martial Arts & Fitness programs.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-3.5 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 text-[#EF4444] text-sm text-center">
            {serverError}
          </div>
        )}

        {successMsg ? (
          <div className="p-6 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-center">
            <div className="w-12 h-12 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981] mx-auto mb-3 text-xl font-bold">
              ✓
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Check Your Email</h3>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              {successMsg}
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 rounded-lg bg-[#E50914] text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  {...register("firstName")}
                  className="w-full h-11 px-4 rounded-lg bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors text-sm"
                />
                {errors.firstName && (
                  <p className="text-xs text-[#EF4444] mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  {...register("lastName")}
                  className="w-full h-11 px-4 rounded-lg bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors text-sm"
                />
                {errors.lastName && (
                  <p className="text-xs text-[#EF4444] mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="john.doe@example.com"
                {...register("email")}
                className="w-full h-11 px-4 rounded-lg bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors text-sm"
              />
              {errors.email && (
                <p className="text-xs text-[#EF4444] mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 555-0199"
                  {...register("phone")}
                  className="w-full h-11 px-4 rounded-lg bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors text-sm"
                />
                {errors.phone && (
                  <p className="text-xs text-[#EF4444] mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="India / United States"
                  {...register("country")}
                  className="w-full h-11 px-4 rounded-lg bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors text-sm"
                />
                {errors.country && (
                  <p className="text-xs text-[#EF4444] mt-1">{errors.country.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full h-11 px-4 rounded-lg bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors text-sm"
                />
                {errors.password && (
                  <p className="text-xs text-[#EF4444] mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="w-full h-11 px-4 rounded-lg bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors text-sm"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-[#EF4444] mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-2 rounded-lg bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-bold text-base hover:opacity-95 transition-opacity shadow-lg shadow-[#E50914]/20 cursor-pointer disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-[#E50914] font-semibold hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
