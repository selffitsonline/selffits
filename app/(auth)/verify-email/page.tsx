"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmailAction } from "@/actions/auth.actions";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState<string>("Verifying your email address...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token was provided.");
      return;
    }

    const runVerification = async () => {
      const res = await verifyEmailAction(token);
      if (res.success) {
        setStatus("success");
        setMessage(res.message || "Your email address has been verified successfully!");
      } else {
        setStatus("error");
        setMessage(res.error || "Failed to verify email address.");
      }
    };

    runVerification();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-[#E50914]/15 to-[#0080FF]/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#14161D] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl text-center">
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
            Email Verification
          </h1>
        </div>

        {status === "verifying" && (
          <div className="py-8">
            <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-sm">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-4">
            <div className="w-14 h-14 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] text-2xl font-bold mx-auto mb-4">
              ✓
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Verification Complete</h3>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">{message}</p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Log In to Dashboard
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-4">
            <div className="w-14 h-14 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] text-2xl font-bold mx-auto mb-4">
              !
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Verification Failed</h3>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">{message}</p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 rounded-lg bg-[#1F2937] border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
