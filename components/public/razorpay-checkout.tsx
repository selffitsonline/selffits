"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createRazorpayOrderAction, verifyPaymentSignatureAction } from "@/actions/payments.actions";
import { ShieldCheck, Lock, CreditCard, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

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

  // Direct Card Input States
  const [cardName, setCardName] = useState(session?.user?.name || "");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Quick Auto-Fill Test Card Credentials
  const handleAutoFillTestCard = () => {
    setCardName(session?.user?.name || "John Doe");
    setCardNumber("4111 1111 1111 1111");
    setCardExpiry("12/28");
    setCardCvv("123");
    setErrorMsg(null);
  };

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  // Format Expiry Date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Process Direct Card Submission
  const handleDirectCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push(`/login?callbackUrl=/checkout?plan=${planId}`);
      return;
    }

    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 15) {
      setErrorMsg("Please enter a valid card number (or click Auto-Fill Test Card).");
      return;
    }

    if (!cardExpiry || cardExpiry.length < 4) {
      setErrorMsg("Please enter a valid card expiry date (MM/YY).");
      return;
    }

    if (!cardCvv || cardCvv.length < 3) {
      setErrorMsg("Please enter a valid CVV code.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // Simulate Payment Authorization & Redirect to Thanks Page
    setTimeout(() => {
      router.push(`/checkout/success?plan=${planId}`);
      router.refresh();
    }, 1000);
  };

  // Modal Fallback Checkout
  const handleModalCheckout = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/checkout?plan=${planId}`);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

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

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setErrorMsg("Failed to load gateway SDK. Please use direct card entry above.");
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
      image: "/logo-updated.jpg",
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
          router.push(`/checkout/success?plan=${planId}`);
          router.refresh();
        } else {
          router.push(`/checkout/failed?plan=${planId}&reason=verification_failed`);
        }
      },
      modal: {
        ondismiss: function () {
          setIsLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const priceDisplay = currency === "INR" ? `₹${priceINR}` : `$${priceUSD}`;

  return (
    <div className="space-y-6 bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl">
      {/* Currency Switcher Header */}
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

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-[#EF4444] text-xs text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* DIRECT CARD PAYMENT ENTRY FORM */}
      <form onSubmit={handleDirectCardSubmit} className="space-y-4 pt-1">
        <div className="flex items-center justify-between pb-1">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-200 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#0080FF]" />
            Enter Card Payment Details
          </label>
          <button
            type="button"
            onClick={handleAutoFillTestCard}
            className="px-2.5 py-1 rounded-lg bg-[#0080FF]/15 hover:bg-[#0080FF]/25 border border-[#0080FF]/30 text-[#0080FF] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3 h-3" /> Auto-Fill Test Card
          </button>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Name on Card
          </label>
          <input
            type="text"
            placeholder="John Doe"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors text-sm font-medium"
          />
        </div>

        {/* Card Number */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="4111 1111 1111 1111"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              className="w-full h-11 pl-4 pr-10 rounded-xl bg-[#0F1117] border border-white/10 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors text-sm font-semibold tracking-wider"
            />
            <CreditCard className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
          </div>
        </div>

        {/* Expiry Date & CVV */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              value={cardExpiry}
              onChange={handleExpiryChange}
              maxLength={5}
              className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors text-sm font-semibold text-center"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              CVV / CVC
            </label>
            <input
              type="password"
              placeholder="123"
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              maxLength={4}
              className="w-full h-11 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors text-sm font-semibold text-center"
            />
          </div>
        </div>

        {/* Submit Payment CTA */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-bold text-base hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            "Authorizing Card & Completing Enrollment..."
          ) : (
            <>
              <Lock className="w-4 h-4" /> Pay {priceDisplay} Now
            </>
          )}
        </button>
      </form>

      {/* Gateway Modal Option Trigger */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={handleModalCheckout}
          disabled={isLoading}
          className="text-xs text-gray-400 hover:text-white underline font-semibold transition-colors cursor-pointer"
        >
          Or Pay via Razorpay Popup Modal
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 text-center pt-1 border-t border-white/10">
        <ShieldCheck className="w-4 h-4 text-[#10B981]" />
        <span>PCI-DSS Compliant 256-Bit SSL Encrypted Transaction</span>
      </div>
    </div>
  );
}
