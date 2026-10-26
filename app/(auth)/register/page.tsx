"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MartialArtsRegistrationSchema,
  WeightFitnessRegistrationSchema,
  MartialArtsRegistrationInput,
  WeightFitnessRegistrationInput,
} from "@/types/validation.schemas";
import { registerStudentAction, resendVerificationEmailAction } from "@/actions/auth.actions";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { Turnstile, TurnstileRef } from "@/components/ui/turnstile";
import { ShieldCheck, Mail, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

type ProgramChoice = "MARTIAL_ARTS" | "WEIGHT_MANAGEMENT_FITNESS";

export default function RegisterPage() {
  const [selectedProgram, setSelectedProgram] = useState<ProgramChoice>("MARTIAL_ARTS");
  const [serverError, setServerError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ email: string; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileRef | null>(null);

  // Resend in success screen state
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  // 1. Martial Arts Form
  const martialForm = useForm<MartialArtsRegistrationInput>({
    resolver: zodResolver(MartialArtsRegistrationSchema),
    defaultValues: {
      registeredProgram: "MARTIAL_ARTS",
      fullName: "",
      email: "",
      phone: "+91 ",
      country: DEFAULT_COUNTRY.name,
      studentType: "Adult (18+)",
      martialArtsLevel: "Beginner — I'm just starting",
      currentWeightKg: undefined,
      trainingGoal: "Self-defence",
      password: "",
      confirmPassword: "",
    },
  });

  // 2. Weight Management & Fitness Form
  const fitnessForm = useForm<WeightFitnessRegistrationInput>({
    resolver: zodResolver(WeightFitnessRegistrationSchema),
    defaultValues: {
      registeredProgram: "WEIGHT_MANAGEMENT_FITNESS",
      fullName: "",
      email: "",
      phone: "+91 ",
      country: DEFAULT_COUNTRY.name,
      ageGroup: "Adult (18+)",
      currentWeightKg: undefined,
      targetWeightKg: undefined,
      fitnessGoal: "Weight management",
      fitnessLevel: "Beginner",
      workoutFrequency: "3 days per week",
      password: "",
      confirmPassword: "",
    },
  });

  // Watch Martial Arts student type for conditional email placeholder
  const martialStudentType = martialForm.watch("studentType");
  const emailPlaceholder =
    martialStudentType === "Child (under 18)"
      ? "Parent/guardian email"
      : "Enter email address";

  const onMartialSubmit = async (data: MartialArtsRegistrationInput) => {
    setIsLoading(true);
    setServerError(null);

    const payload = {
      ...data,
      turnstileToken: turnstileToken || "",
    };

    const res = await registerStudentAction(payload);

    if (!res.success) {
      if (res.fieldErrors) {
        Object.entries(res.fieldErrors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            martialForm.setError(field as keyof MartialArtsRegistrationInput, {
              type: "server",
              message: messages[0],
            });
          }
        });
      }
      setServerError(res.error || "Failed to create account. Please verify details.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
      setIsLoading(false);
      return;
    }

    setSuccessInfo({
      email: data.email,
      message: res.message || "Registration successful! Please check your email inbox to verify your account.",
    });
    setIsLoading(false);
  };

  const onFitnessSubmit = async (data: WeightFitnessRegistrationInput) => {
    setIsLoading(true);
    setServerError(null);

    const payload = {
      ...data,
      turnstileToken: turnstileToken || "",
    };

    const res = await registerStudentAction(payload);

    if (!res.success) {
      if (res.fieldErrors) {
        Object.entries(res.fieldErrors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            fitnessForm.setError(field as keyof WeightFitnessRegistrationInput, {
              type: "server",
              message: messages[0],
            });
          }
        });
      }
      setServerError(res.error || "Failed to create account. Please verify details.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
      setIsLoading(false);
      return;
    }

    setSuccessInfo({
      email: data.email,
      message: res.message || "Registration successful! Please check your email inbox to verify your account.",
    });
    setIsLoading(false);
  };

  const handleResendFromSuccess = async () => {
    if (!successInfo?.email) return;
    setIsResending(true);
    setResendStatus(null);

    const res = await resendVerificationEmailAction({
      email: successInfo.email,
      turnstileToken: turnstileToken || "",
    });

    setResendStatus(res.message || res.error || "Verification link dispatched.");
    setIsResending(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col items-center justify-center p-4 py-12 relative overflow-x-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-[#E50914]/15 to-[#0080FF]/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[700px] bg-[#14161D] border border-white/10 rounded-2xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
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
        </div>

        {/* Success Confirmation View */}
        {successInfo ? (
          <div className="p-6 sm:p-8 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] mx-auto text-2xl font-black shadow-lg">
              ✓
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight uppercase">
              VERIFY YOUR EMAIL ADDRESS
            </h2>
            <div className="text-gray-300 text-xs sm:text-sm leading-relaxed space-y-3">
              <p className="font-semibold text-white">
                We have sent a verification link to: <span className="text-[#38BDF8]">{successInfo.email}</span>
              </p>
              <p className="text-gray-300">
                Email verification is compulsory to activate your student account. Please click the link in your email to verify your address before logging in.
              </p>
              <p className="text-amber-400 text-xs font-semibold">
                ⏳ The verification link will expire in 24 hours.
              </p>
            </div>

            {resendStatus && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-200">
                {resendStatus}
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-all text-center inline-flex items-center justify-center gap-2"
              >
                GO TO LOGIN
              </Link>
              <button
                type="button"
                onClick={handleResendFromSuccess}
                disabled={isResending}
                className="py-3 px-4 rounded-xl bg-[#1F2937] hover:bg-[#283548] border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                {isResending ? "SENDING..." : "RESEND EMAIL"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* 1. Programme Selection */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 text-center sm:text-left">
                What would you like to register for? <span className="text-[#E50914]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProgram("MARTIAL_ARTS");
                    setServerError(null);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedProgram === "MARTIAL_ARTS"
                      ? "bg-[#E50914]/15 border-[#E50914] text-white shadow-lg shadow-[#E50914]/10"
                      : "bg-[#0F1117] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-wide">Martial Arts</span>
                  <span className="text-[11px] text-gray-400 mt-1">Online Martial Arts Academy</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedProgram("WEIGHT_MANAGEMENT_FITNESS");
                    setServerError(null);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedProgram === "WEIGHT_MANAGEMENT_FITNESS"
                      ? "bg-[#E50914]/15 border-[#E50914] text-white shadow-lg shadow-[#E50914]/10"
                      : "bg-[#0F1117] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-wide">Weight Management & Fitness</span>
                  <span className="text-[11px] text-gray-400 mt-1">Personalised Fitness Journey</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {serverError && (
              <div className="mb-6 p-3.5 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-[#EF4444] text-xs sm:text-sm text-center font-medium">
                {serverError}
              </div>
            )}

            {/* 2. Martial Arts Questionnaire Form */}
            {selectedProgram === "MARTIAL_ARTS" && (
              <div>
                {/* Heading & Subtitle */}
                <div className="mb-5 pb-4 border-b border-white/10">
                  <h1 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-outfit)] tracking-tight text-white">
                    Create Your Student Profile
                  </h1>
                  <p className="text-xs font-extrabold tracking-widest text-[#E50914] uppercase mt-1">
                    ONLINE MARTIAL ARTS ACADEMY
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Start your martial arts journey. Tell us a little about yourself so we can personalise your training.
                  </p>
                </div>

                <form onSubmit={martialForm.handleSubmit(onMartialSubmit)} className="space-y-3.5 sm:space-y-4">
                  {/* Row 1: Full Name & Contact Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    {/* Student's Full Name */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                        Student&apos;s full name <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        {...martialForm.register("fullName")}
                        className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                          martialForm.formState.errors.fullName
                            ? "border-[#EF4444] focus:border-[#EF4444]"
                            : "border-white/10 focus:border-[#E50914]"
                        }`}
                      />
                      {martialForm.formState.errors.fullName && (
                        <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                          {martialForm.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    {/* Contact Email (Conditional Placeholder based on Student Type) */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                        Contact email <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder={emailPlaceholder}
                        {...martialForm.register("email")}
                        className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                          martialForm.formState.errors.email
                            ? "border-[#EF4444] focus:border-[#EF4444]"
                            : "border-white/10 focus:border-[#E50914]"
                        }`}
                      />
                      {martialForm.formState.errors.email && (
                        <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                          {martialForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Phone Number / WhatsApp & Student Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    {/* Phone Number / WhatsApp */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                        Phone Number / WhatsApp <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 Enter phone number"
                        {...martialForm.register("phone")}
                        className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                          martialForm.formState.errors.phone
                            ? "border-[#EF4444] focus:border-[#EF4444]"
                            : "border-white/10 focus:border-[#E50914]"
                        }`}
                      />
                      <p className="text-[11px] text-gray-500 mt-1">Include your country code.</p>
                      {martialForm.formState.errors.phone && (
                        <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                          {martialForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>

                    {/* Student Type Radio Selection */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                        Student type <span className="text-[#E50914]">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2.5 h-11">
                        {(["Child (under 18)", "Adult (18+)"] as const).map((type) => (
                          <label
                            key={type}
                            className={`px-2.5 sm:px-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer text-xs font-medium transition-all ${
                              martialForm.watch("studentType") === type
                                ? "bg-[#E50914]/15 border-[#E50914] text-white"
                                : "bg-[#0F1117] border-white/10 text-gray-400 hover:border-white/20"
                            }`}
                          >
                            <input
                              type="radio"
                              value={type}
                              {...martialForm.register("studentType")}
                              className="text-[#E50914] focus:ring-[#E50914]"
                            />
                            <span className="truncate">{type}</span>
                          </label>
                        ))}
                      </div>
                      {martialForm.formState.errors.studentType && (
                        <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                          {martialForm.formState.errors.studentType.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Current Martial Arts Level */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                      Current martial arts level <span className="text-[#E50914]">*</span>
                    </label>
                    <div className="space-y-2">
                      {(
                        [
                          "Beginner — I'm just starting",
                          "Intermediate — I have some experience",
                          "Advanced — I train regularly",
                        ] as const
                      ).map((level) => (
                        <label
                          key={level}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs font-medium transition-all ${
                            martialForm.watch("martialArtsLevel") === level
                              ? "bg-[#E50914]/15 border-[#E50914] text-white"
                              : "bg-[#0F1117] border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          <input
                            type="radio"
                            value={level}
                            {...martialForm.register("martialArtsLevel")}
                            className="text-[#E50914] focus:ring-[#E50914]"
                          />
                          <span>{level}</span>
                        </label>
                      ))}
                    </div>
                    {martialForm.formState.errors.martialArtsLevel && (
                      <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                        {martialForm.formState.errors.martialArtsLevel.message}
                      </p>
                    )}
                  </div>

                  {/* Current Weight (kg) — optional */}
                  <div className="sm:w-1/2 sm:pr-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                      Current weight (kg) <span className="text-gray-500 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Enter weight in kg (optional)"
                      {...martialForm.register("currentWeightKg", {
                        setValueAs: (v) => (v === "" || v === null || isNaN(Number(v)) ? undefined : Number(v)),
                      })}
                      className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] transition-colors text-xs sm:text-sm"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Optional. Used only for private fitness progress tracking.
                    </p>
                    {martialForm.formState.errors.currentWeightKg && (
                      <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                        {martialForm.formState.errors.currentWeightKg.message}
                      </p>
                    )}
                  </div>

                  {/* Your Main Training Goal */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                      Your main training goal <span className="text-[#E50914]">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(
                        [
                          "Self-defence",
                          "Fitness and flexibility",
                          "Strength and endurance",
                          "Belts and techniques",
                          "Competition preparation",
                          "Confidence and discipline",
                        ] as const
                      ).map((goal) => (
                        <label
                          key={goal}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs font-medium transition-all ${
                            martialForm.watch("trainingGoal") === goal
                              ? "bg-[#E50914]/15 border-[#E50914] text-white"
                              : "bg-[#0F1117] border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          <input
                            type="radio"
                            value={goal}
                            {...martialForm.register("trainingGoal")}
                            className="text-[#E50914] focus:ring-[#E50914]"
                          />
                          <span>{goal}</span>
                        </label>
                      ))}
                    </div>
                    {martialForm.formState.errors.trainingGoal && (
                      <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                        {martialForm.formState.errors.trainingGoal.message}
                      </p>
                    )}
                  </div>

                  {/* Account Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                        Password <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...martialForm.register("password")}
                        className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                          martialForm.formState.errors.password
                            ? "border-[#EF4444] focus:border-[#EF4444]"
                            : "border-white/10 focus:border-[#E50914]"
                        }`}
                      />
                      {martialForm.formState.errors.password && (
                        <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                          {martialForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                        Confirm Password <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...martialForm.register("confirmPassword")}
                        className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                          martialForm.formState.errors.confirmPassword
                            ? "border-[#EF4444] focus:border-[#EF4444]"
                            : "border-white/10 focus:border-[#E50914]"
                        }`}
                      />
                      {martialForm.formState.errors.confirmPassword && (
                        <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                          {martialForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Turnstile Bot Verification */}
                  <Turnstile
                    ref={turnstileRef}
                    onVerify={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken("")}
                    theme="dark"
                  />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:opacity-95 transition-opacity shadow-lg shadow-[#E50914]/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? "CREATING PROFILE..." : "CREATE STUDENT PROFILE"}
                  </button>
                </form>
              </div>
            )}

            {/* 3. Weight Management & Fitness Questionnaire Form */}
            {selectedProgram === "WEIGHT_MANAGEMENT_FITNESS" && (
              <div>
                {/* Heading & Subtitle */}
                <div className="mb-5 pb-4 border-b border-white/10">
                  <h1 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-outfit)] tracking-tight text-white">
                    Create Your Student Profile
                  </h1>
                  <p className="text-xs font-extrabold tracking-widest text-[#E50914] uppercase mt-1">
                    WEIGHT MANAGEMENT & FITNESS
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Tell us about yourself to personalise your fitness journey.
                  </p>
                </div>

                <form onSubmit={fitnessForm.handleSubmit(onFitnessSubmit)} className="space-y-3.5 sm:space-y-4">
                  {/* Row 1: Full Name & Email Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                        Full Name <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        {...fitnessForm.register("fullName")}
                        className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                          fitnessForm.formState.errors.fullName
                            ? "border-[#EF4444] focus:border-[#EF4444]"
                            : "border-white/10 focus:border-[#E50914]"
                        }`}
                      />
                      {fitnessForm.formState.errors.fullName && (
                        <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                          {fitnessForm.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                        Email Address <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        {...fitnessForm.register("email")}
                        className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                          fitnessForm.formState.errors.email
                            ? "border-[#EF4444] focus:border-[#EF4444]"
                            : "border-white/10 focus:border-[#E50914]"
                        }`}
                      />
                      {fitnessForm.formState.errors.email && (
                        <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                          {fitnessForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Phone Number / WhatsApp & Age Group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    {/* Phone Number / WhatsApp */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                        Phone Number / WhatsApp <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 Enter phone number"
                        {...fitnessForm.register("phone")}
                        className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                          fitnessForm.formState.errors.phone
                            ? "border-[#EF4444] focus:border-[#EF4444]"
                            : "border-white/10 focus:border-[#E50914]"
                        }`}
                      />
                      <p className="text-[11px] text-gray-500 mt-1">Include your country code.</p>
                      {fitnessForm.formState.errors.phone && (
                        <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                          {fitnessForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>

                    {/* Age Group */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                        Age Group <span className="text-[#E50914]">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2.5 h-11">
                        {(["Child (under 18)", "Adult (18+)"] as const).map((group) => (
                          <label
                            key={group}
                            className={`px-2.5 sm:px-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer text-xs font-medium transition-all ${
                              fitnessForm.watch("ageGroup") === group
                                ? "bg-[#E50914]/15 border-[#E50914] text-white"
                                : "bg-[#0F1117] border-white/10 text-gray-400 hover:border-white/20"
                            }`}
                          >
                            <input
                              type="radio"
                              value={group}
                              {...fitnessForm.register("ageGroup")}
                              className="text-[#E50914] focus:ring-[#E50914]"
                            />
                            <span className="truncate">{group}</span>
                          </label>
                        ))}
                      </div>
                      {fitnessForm.formState.errors.ageGroup && (
                        <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                          {fitnessForm.formState.errors.ageGroup.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Current & Target Weight */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                        Current Weight (kg) <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Enter current weight"
                        {...fitnessForm.register("currentWeightKg", {
                          setValueAs: (v) => (v === "" || v === null || isNaN(Number(v)) ? undefined : Number(v)),
                        })}
                        className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                          fitnessForm.formState.errors.currentWeightKg
                            ? "border-[#EF4444] focus:border-[#EF4444]"
                            : "border-white/10 focus:border-[#E50914]"
                        }`}
                      />
                      {fitnessForm.formState.errors.currentWeightKg && (
                        <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                          {fitnessForm.formState.errors.currentWeightKg.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                        Target Weight (kg) <span className="text-gray-500 font-normal lowercase">(optional)</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Enter target weight (optional)"
                        {...fitnessForm.register("targetWeightKg", {
                          setValueAs: (v) => (v === "" || v === null || isNaN(Number(v)) ? undefined : Number(v)),
                        })}
                        className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] transition-colors text-xs sm:text-sm"
                      />
                      {fitnessForm.formState.errors.targetWeightKg && (
                        <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                          {fitnessForm.formState.errors.targetWeightKg.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Main Fitness Goal */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                      Main Fitness Goal <span className="text-[#E50914]">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(
                        [
                          "Weight management",
                          "Improve overall fitness",
                          "Build strength and muscle",
                          "Improve stamina and endurance",
                          "Flexibility and mobility",
                          "Healthy lifestyle",
                        ] as const
                      ).map((goal) => (
                        <label
                          key={goal}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs font-medium transition-all ${
                            fitnessForm.watch("fitnessGoal") === goal
                              ? "bg-[#E50914]/15 border-[#E50914] text-white"
                              : "bg-[#0F1117] border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          <input
                            type="radio"
                            value={goal}
                            {...fitnessForm.register("fitnessGoal")}
                            className="text-[#E50914] focus:ring-[#E50914]"
                          />
                          <span>{goal}</span>
                        </label>
                      ))}
                    </div>
                    {fitnessForm.formState.errors.fitnessGoal && (
                      <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                        {fitnessForm.formState.errors.fitnessGoal.message}
                      </p>
                    )}
                  </div>

                  {/* Current Fitness Level */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                      Current Fitness Level <span className="text-[#E50914]">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => (
                        <label
                          key={level}
                          className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer text-xs font-medium text-center transition-all ${
                            fitnessForm.watch("fitnessLevel") === level
                              ? "bg-[#E50914]/15 border-[#E50914] text-white"
                              : "bg-[#0F1117] border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          <input
                            type="radio"
                            value={level}
                            {...fitnessForm.register("fitnessLevel")}
                            className="sr-only"
                          />
                          <span>{level}</span>
                        </label>
                      ))}
                    </div>
                    {fitnessForm.formState.errors.fitnessLevel && (
                      <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                        {fitnessForm.formState.errors.fitnessLevel.message}
                      </p>
                    )}
                  </div>

                  {/* Preferred Workout Frequency */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                      Preferred Workout Frequency <span className="text-[#E50914]">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(
                        [
                          "1–2 days per week",
                          "3 days per week",
                          "4–5 days per week",
                          "Flexible schedule",
                        ] as const
                      ).map((freq) => (
                        <label
                          key={freq}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs font-medium transition-all ${
                            fitnessForm.watch("workoutFrequency") === freq
                              ? "bg-[#E50914]/15 border-[#E50914] text-white"
                              : "bg-[#0F1117] border-white/10 text-gray-400 hover:border-white/20"
                          }`}
                        >
                          <input
                            type="radio"
                            value={freq}
                            {...fitnessForm.register("workoutFrequency")}
                            className="text-[#E50914] focus:ring-[#E50914]"
                          />
                          <span>{freq}</span>
                        </label>
                      ))}
                    </div>
                    {fitnessForm.formState.errors.workoutFrequency && (
                      <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                        {fitnessForm.formState.errors.workoutFrequency.message}
                      </p>
                    )}
                  </div>

                  {/* Account Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                        Password <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...fitnessForm.register("password")}
                        className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                          fitnessForm.formState.errors.password
                            ? "border-[#EF4444] focus:border-[#EF4444]"
                            : "border-white/10 focus:border-[#E50914]"
                        }`}
                      />
                      {fitnessForm.formState.errors.password && (
                        <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                          {fitnessForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                        Confirm Password <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...fitnessForm.register("confirmPassword")}
                        className={`w-full h-11 px-4 rounded-xl bg-[#0F1117] border text-white placeholder-gray-500 focus:outline-none transition-colors text-xs sm:text-sm ${
                          fitnessForm.formState.errors.confirmPassword
                            ? "border-[#EF4444] focus:border-[#EF4444]"
                            : "border-white/10 focus:border-[#E50914]"
                        }`}
                      />
                      {fitnessForm.formState.errors.confirmPassword && (
                        <p className="text-[11px] text-[#EF4444] mt-1 font-medium">
                          {fitnessForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Turnstile Bot Verification */}
                  <Turnstile
                    ref={turnstileRef}
                    onVerify={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken("")}
                    theme="dark"
                  />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:opacity-95 transition-opacity shadow-lg shadow-[#E50914]/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? "CREATING PROFILE..." : "CREATE STUDENT PROFILE"}
                  </button>
                </form>
              </div>
            )}

            {/* Link to Login */}
            <div className="mt-6 text-center text-xs text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-[#E50914] font-semibold hover:underline">
                Log In Here
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
