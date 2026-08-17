"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createRazorpayOrderAction, verifyPaymentSignatureAction } from "@/actions/payments.actions";
import { ShieldCheck, Lock } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  planId: string;
  planName: string;
  priceINR: number;
  priceUSD: number;
}

export function RazorpayCheckout({ planId, planName, priceINR, priceUSD }: RazorpayCheckoutProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/checkout?plan=${planId}`);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setErrorMsg("Failed to load Razorpay Payment gateway SDK. Please check your internet connection.");
      setIsLoading(false);
      return;
    }

    const orderRes = await createRazorpayOrderAction(planId, currency);
    if (!orderRes.success || !orderRes.orderId) {
      setErrorMsg(orderRes.error || "Order creation failed.");
      setIsLoading(false);
      return;
    }

    const options = {
      key: orderRes.keyId,
      amount: orderRes.amount,
      currency: orderRes.currency,
      name: "SELFFITS Academy",
      description: `Enrollment: ${orderRes.planName}`,
      image: "/logo.jpg",
      order_id: orderRes.orderId,
      prefill: {
        name: session.user.name || "",
        email: session.user.email || "",
      },
      theme: {
        color: "#E50914",
      },
      handler: async function (response: any) {
        const verifyRes = await verifyPaymentSignatureAction({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          planId: planId,
        });

        if (verifyRes.success) {
          router.push("/dashboard?enrollment=success");
          router.refresh();
        } else {
          router.push(`/checkout/failed?plan=${planId}&reason=verification_failed`);
        }
      },
      modal: {
        ondismiss: function () {
          setIsLoading(false);
          router.push(`/checkout/failed?plan=${planId}&reason=cancelled`);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const priceDisplay = currency === "INR" ? `₹${priceINR}` : `$${priceUSD}`;

  return (
    <div className="space-y-6 bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl">
      {/* Currency Switcher */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <span className="text-xs font-bold text-gray-300">Select Billing Currency:</span>
        <div className="flex items-center bg-[#0F1117] p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setCurrency("INR")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currency === "INR" ? "bg-[#0080FF] text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            🇮🇳 INR (₹)
          </button>
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currency === "USD" ? "bg-[#0080FF] text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            🌐 USD ($)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-[#EF4444] text-xs text-center">
          {errorMsg}
        </div>
      )}

      {/* Plan Summary Box */}
      <div className="p-5 rounded-2xl bg-[#0F1117] border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white">{planName}</h4>
          <span className="text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
            {priceDisplay}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Includes live Google Meet & Zoom class access, form evaluation, and belt certificate.
        </p>
      </div>

      {/* Checkout CTA */}
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-bold text-base hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isLoading ? (
          "Opening Razorpay Gateway..."
        ) : (
          <>
            <Lock className="w-4 h-4" /> Pay {priceDisplay} via Razorpay
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 text-center">
        <ShieldCheck className="w-4 h-4 text-[#10B981]" />
        <span>PCI-DSS Compliant 256-Bit SSL Encrypted Transaction</span>
      </div>
    </div>
  );
}
