"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmailAction, resendVerificationEmailAction } from "@/actions/auth.actions";
import { Turnstile, TurnstileRef } from "@/components/ui/turnstile";
import { CheckCircle2, AlertCircle, RefreshCw, Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState<string>("Verifying your email address...");

  // Replacement request form state
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileRef | null>(null);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken("");
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token was provided in the link. Please request a new verification email.");
      return;
    }

    let isMounted = true;

    const runVerification = async () => {
      const res = await verifyEmailAction(token);
      if (!isMounted) return;

      if (res.success) {
        setStatus("success");
        setMessage(res.message || "Your email address has been verified successfully! You can now log in.");
      } else {
        setStatus("error");
        setMessage(
          res.error ||
            "This verification link is invalid or has expired. Please request a replacement verification email below."
        );
      }
    };

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail || !resendEmail.includes("@")) {
      setResendStatus("Please enter a valid email address.");
      return;
    }

    setIsResending(true);
    setResendStatus(null);

    const res = await resendVerificationEmailAction({
      email: resendEmail,
      turnstileToken: turnstileToken || "",
    });

    if (res.success) {
      setResendStatus(res.message || "A replacement verification link has been sent to your email.");
    } else {
      setResendStatus(res.error || "Failed to send replacement link. Please try again.");
    }

    turnstileRef.current?.reset();
    setTurnstileToken("");
    setIsResending(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-[#E50914]/15 to-[#0080FF]/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#14161D] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center">
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
          <div className="py-8 space-y-4">
            <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-300 text-sm">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] text-2xl font-bold mx-auto">
              ✓
            </div>
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
              Account Verified Successfully!
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{message}</p>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity inline-flex items-center justify-center gap-2 shadow-lg shadow-[#E50914]/20"
              >
                LOG IN TO YOUR ACCOUNT
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="py-2 space-y-4 text-left">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 text-xl font-bold mx-auto">
              !
            </div>
            <h2 className="text-base font-bold text-white text-center font-[family-name:var(--font-outfit)]">
              Verification Link Expired or Invalid
            </h2>
            <p className="text-gray-400 text-xs leading-relaxed text-center">{message}</p>

            {/* Replacement verification request form */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 text-center">
                Request a Replacement Link
              </h3>

              {resendStatus && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-center text-amber-300 font-medium">
                  {resendStatus}
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-3">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] text-xs sm:text-sm"
                  required
                />

                <Turnstile
                  ref={turnstileRef}
                  onVerify={handleTurnstileVerify}
                  onExpire={handleTurnstileExpire}
                  theme="dark"
                />

                <button
                  type="submit"
                  disabled={isResending}
                  className="w-full h-11 rounded-xl bg-[#1F2937] hover:bg-[#283548] border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                  {isResending ? "SENDING LINK..." : "RESEND VERIFICATION LINK"}
                </button>
              </form>
            </div>

            <div className="pt-2 text-center">
              <Link href="/login" className="text-xs text-gray-400 hover:text-white transition-colors">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
