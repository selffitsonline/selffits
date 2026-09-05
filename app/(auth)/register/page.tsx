"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, RegisterInput } from "@/types/validation.schemas";
import { registerStudentAction } from "@/actions/auth.actions";
import { COUNTRIES, getCountryByNameOrCode, DEFAULT_COUNTRY, Country } from "@/lib/countries";
import { CountryDropdown, DialCodeDropdown } from "@/components/ui/country-phone-selector";
import { ChevronDown, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      country: DEFAULT_COUNTRY.name,
      phone: "",
      age: 18,
      gender: "Male",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedCountryName = watch("country");
  const selectedCountry = getCountryByNameOrCode(selectedCountryName);

  const [nationalPhone, setNationalPhone] = useState("");

  // Synchronize Country Selection -> Updates Country and Phone section Dial Code
  const handleCountrySelect = (countryObj: Country) => {
    setValue("country", countryObj.name, { shouldValidate: true });
    
    // Update full phone value with newly selected country dial code
    if (nationalPhone.trim()) {
      setValue("phone", `${countryObj.dialCode} ${nationalPhone.trim()}`, { shouldValidate: true });
    } else {
      setValue("phone", "", { shouldValidate: false });
    }
    clearErrors("phone");
  };

  // Synchronize Phone Input typing
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanDigits = rawVal.replace(/[^\d]/g, "");
    setNationalPhone(cleanDigits);

    if (cleanDigits) {
      setValue("phone", `${selectedCountry.dialCode} ${cleanDigits}`, { shouldValidate: true });
    } else {
      setValue("phone", "", { shouldValidate: true });
    }
  };

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
      setServerError(res.error || "Failed to create account. Please check your details and try again.");
      setIsLoading(false);
      return;
    }

    setSuccessMsg(res.message || "Account registered successfully! Please check your email to verify.");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col items-center justify-center p-4 py-12 relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#E50914]/15 to-[#0080FF]/15 rounded-full blur-[130px] pointer-events-none" />

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
              className="h-auto w-auto object-contain rounded-lg mb-2 hover:opacity-90 transition-opacity"
            />
          </Link>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] tracking-tight text-white mt-2">
            Student Registration
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 text-center max-w-md">
            Create your account to enroll in live Martial Arts & Fitness programs.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-[#EF4444] text-xs sm:text-sm text-center font-medium">
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
            <div className="text-gray-300 text-xs sm:text-sm leading-relaxed space-y-3">
              <p className="font-semibold text-white">
                Your student account has been created successfully.
              </p>
              <p className="text-gray-300">
                You can now log in using your registered email address and password to access your dashboard and select your class schedules.
              </p>
            </div>
            <div className="pt-3">
              <Link
                href="/login"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/25 inline-flex items-center justify-center gap-2"
              >
                LOG IN TO YOUR DASHBOARD
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  First Name <span className="text-[#E50914]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="John"
                  {...register("firstName")}
                  className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                    errors.firstName
                      ? "border-[#EF4444] focus:border-[#EF4444]"
                      : "border-white/10 focus:border-[#E50914]"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-[11px] text-[#EF4444] mt-1 font-medium">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Last Name <span className="text-[#E50914]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  {...register("lastName")}
                  className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                    errors.lastName
                      ? "border-[#EF4444] focus:border-[#EF4444]"
                      : "border-white/10 focus:border-[#E50914]"
                  }`}
                />
                {errors.lastName && (
                  <p className="text-[11px] text-[#EF4444] mt-1 font-medium">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Email Address <span className="text-[#E50914]">*</span>
              </label>
              <input
                type="email"
                placeholder="john.doe@example.com"
                {...register("email")}
                className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                  errors.email
                    ? "border-[#EF4444] focus:border-[#EF4444]"
                    : "border-white/10 focus:border-[#E50914]"
                }`}
              />
              {errors.email && (
                <p className="text-[11px] text-[#EF4444] mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Country & Phone Number (Placed on the SAME line/row to reduce scrolling) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. COUNTRY Field FIRST (Shows ONLY Flag + Country Name) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Country <span className="text-[#E50914]">*</span>
                </label>
                <CountryDropdown
                  value={selectedCountryName}
                  onChange={handleCountrySelect}
                  error={errors.country?.message}
                />
                {errors.country && (
                  <p className="text-[11px] text-[#EF4444] mt-1 font-medium">{errors.country.message}</p>
                )}
              </div>

              {/* 2. PHONE NUMBER Field SECOND (Flag + Dial Code + Phone Input inside ONE Single Unified Field) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Phone Number <span className="text-[#E50914]">*</span>
                </label>

                {/* Single Unified Input Container */}
                <div className={`flex items-center w-full h-11 rounded-xl bg-[#0F1117] border transition-all ${
                  errors.phone
                    ? "border-[#EF4444] focus-within:border-[#EF4444]"
                    : "border-white/10 focus-within:border-[#E50914] focus-within:ring-1 focus-within:ring-[#E50914]"
                }`}>
                  {/* Integrated Dial Code Selector */}
                  <DialCodeDropdown
                    value={selectedCountry.dialCode}
                    selectedCountry={selectedCountry}
                    onChange={handleCountrySelect}
                    seamless
                  />

                  {/* Subtle vertical divider */}
                  <div className="w-[1px] h-5 bg-white/15 shrink-0" />

                  {/* Seamless Phone Number Input */}
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={nationalPhone}
                    onChange={handlePhoneInputChange}
                    className="w-full h-full px-3.5 bg-transparent text-white placeholder-gray-500 focus:outline-none text-xs sm:text-sm"
                  />
                </div>

                {/* Hidden react-hook-form binding */}
                <input type="hidden" {...register("phone")} />

                {errors.phone && (
                  <p className="text-[11px] text-[#EF4444] mt-1 font-medium">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* 3. Student Age & 4. Gender Controlled Select Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Student Age <span className="text-[#E50914]">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register("age", { valueAsNumber: true })}
                    className={`w-full h-11 px-4 pr-8 rounded-xl bg-[#0F1117] border text-white focus:outline-none transition-colors text-xs sm:text-sm appearance-none cursor-pointer ${
                      errors.age
                        ? "border-[#EF4444] focus:border-[#EF4444]"
                        : "border-white/10 focus:border-[#E50914]"
                    }`}
                  >
                    <option value="" disabled className="bg-[#0F1117] text-gray-400">
                      Select Student Age
                    </option>
                    {Array.from({ length: 97 }, (_, i) => i + 4).map((ageNum) => (
                      <option key={ageNum} value={ageNum} className="bg-[#0F1117] text-white">
                        {ageNum} Years Old
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                {errors.age && (
                  <p className="text-[11px] text-[#EF4444] mt-1 font-medium">{errors.age.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Gender <span className="text-[#E50914]">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register("gender")}
                    className={`w-full h-11 px-4 pr-8 rounded-xl bg-[#0F1117] border text-white focus:outline-none transition-colors text-xs sm:text-sm appearance-none cursor-pointer ${
                      errors.gender
                        ? "border-[#EF4444] focus:border-[#EF4444]"
                        : "border-white/10 focus:border-[#E50914]"
                    }`}
                  >
                    <option value="" disabled className="bg-[#0F1117] text-gray-400">
                      Select Gender
                    </option>
                    <option value="Male" className="bg-[#0F1117] text-white">
                      Male
                    </option>
                    <option value="Female" className="bg-[#0F1117] text-white">
                      Female
                    </option>
                    <option value="Other" className="bg-[#0F1117] text-white">
                      Other
                    </option>
                    <option value="Prefer not to say" className="bg-[#0F1117] text-white">
                      Prefer not to say
                    </option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                {errors.gender && (
                  <p className="text-[11px] text-[#EF4444] mt-1 font-medium">{errors.gender.message}</p>
                )}
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Password <span className="text-[#E50914]">*</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                    errors.password
                      ? "border-[#EF4444] focus:border-[#EF4444]"
                      : "border-white/10 focus:border-[#E50914]"
                  }`}
                />
                {errors.password && (
                  <p className="text-[11px] text-[#EF4444] mt-1 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Confirm Password <span className="text-[#E50914]">*</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                    errors.confirmPassword
                      ? "border-[#EF4444] focus:border-[#EF4444]"
                      : "border-white/10 focus:border-[#E50914]"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-[11px] text-[#EF4444] mt-1 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-[#E50914]/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs sm:text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-[#E50914] font-semibold hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
