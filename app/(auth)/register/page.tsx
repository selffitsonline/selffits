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
      age: 18,
      gender: "Male",
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
              src="/logo-updated.jpg"
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
          <div className="p-6 sm:p-8 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] mx-auto text-2xl font-black shadow-lg">
              ✓
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight uppercase">
              REGISTRATION SUCCESSFUL!
            </h3>
            <div className="text-gray-300 text-sm leading-relaxed space-y-3">
              <p className="font-semibold text-white">
                Your account has been created successfully.
              </p>
              <p className="text-gray-300">
                To access your Student Dashboard and continue with your course enrollment, please log in using your registered email address and password.
              </p>
              <p className="text-gray-400 text-xs italic">
                Click the button below to log in and proceed to your dashboard.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/25 inline-flex items-center justify-center gap-2"
              >
                LOG IN TO YOUR DASHBOARD
              </Link>
            </div>
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
                  Student Age
                </label>
                <input
                  type="number"
                  placeholder="e.g. 14"
                  min={4}
                  max={100}
                  {...register("age", { valueAsNumber: true })}
                  className="w-full h-11 px-4 rounded-lg bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors text-sm"
                />
                {errors.age && (
                  <p className="text-xs text-[#EF4444] mt-1">{errors.age.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Gender
                </label>
                <select
                  {...register("gender")}
                  className="w-full h-11 px-4 rounded-lg bg-[#0F1117] border border-white/10 text-white focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors text-sm cursor-pointer"
                >
                  <option value="" disabled className="bg-[#0F1117] text-gray-400">Select Gender</option>
                  <option value="Male" className="bg-[#0F1117] text-white">Male</option>
                  <option value="Female" className="bg-[#0F1117] text-white">Female</option>
                  <option value="Other" className="bg-[#0F1117] text-white">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-xs text-[#EF4444] mt-1">{errors.gender.message}</p>
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
