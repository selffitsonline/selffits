"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Tag, Sparkles, Copy, Check, ArrowRight, Percent, DollarSign } from "lucide-react";

export interface HomepageCouponCtaConfig {
  isEnabled: boolean;
  isCouponValid?: boolean;
  badgeText?: string;
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  coupon?: {
    id?: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
  } | null;
}

interface HomepageCouponCtaProps {
  config?: HomepageCouponCtaConfig | null;
}

export function HomepageCouponCta({ config }: HomepageCouponCtaProps) {
  const [copied, setCopied] = useState(false);

  // Safe guard: Do not display if coupon is not active/valid
  if (
    !config ||
    !config.isCouponValid ||
    !config.coupon ||
    !config.coupon.code
  ) {
    return null;
  }

  const { coupon } = config;
  const isPercentage = coupon.discountType === "PERCENTAGE";
  const numDiscountValue = Number(coupon.discountValue) || 0;
  const discountLabel = isPercentage
    ? `${numDiscountValue}% OFF`
    : `$${numDiscountValue.toFixed(2)} OFF`;

  const headingText = config.heading || "Exclusive Academy Enrollment Offer";
  const descriptionText =
    config.description ||
    "Claim an exclusive discount on your live virtual training membership. Enter the coupon code during checkout.";
  const badgeText = config.badgeText || "SPECIAL PROMOTION";
  const buttonText = config.buttonText || "Explore Programs & Redeem";
  const buttonLink = config.buttonLink || "/programs";

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section
      id="promotional-coupon-cta"
      className="py-14 sm:py-20 bg-[#0A0B0E] relative overflow-hidden"
    >
      {/* Outer ambient blue glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#0080FF]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl p-4 sm:p-8 lg:p-12 bg-gradient-to-br from-[#08295E] via-[#0B3D82] to-[#051C3F] border border-[#0080FF]/40 shadow-2xl shadow-[#0080FF]/25 relative overflow-hidden">
          {/* Internal ambient blue lighting */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#0080FF]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#0055B3]/25 rounded-full blur-3xl pointer-events-none" />

          {/* Top highlight line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#0080FF] to-transparent opacity-90" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10">
            {/* Left Column: Promotional Heading & Info */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0080FF]/25 border border-sky-300/40 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-sky-200 shrink-0" />
                <span>{badgeText}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight leading-tight drop-shadow-sm">
                {headingText}
              </h2>

              <p className="text-sky-100/90 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                {descriptionText}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  href={buttonLink}
                  id="cta-explore-programs-btn"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#005EC4] hover:from-[#1A8CFF] hover:to-[#0070E0] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all shadow-xl shadow-[#0080FF]/40 hover:shadow-[#0080FF]/60 border border-sky-300/35 flex items-center gap-2 transform active:scale-95"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>
              </div>
            </div>

            {/* Right Column: Promotional Coupon Voucher Box */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
              <div className="w-full max-w-md rounded-2xl bg-[#040E1E]/90 backdrop-blur-md border-2 border-dashed border-[#0080FF]/50 p-4 sm:p-6 shadow-2xl relative space-y-4 overflow-hidden">
                {/* Discount Badge Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-sky-400/20">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#0080FF]/25 border border-[#0080FF]/40 flex items-center justify-center text-sky-300 shrink-0">
                      <Tag className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-sky-200/90 uppercase tracking-wider block truncate">
                        Official Promo Code
                      </span>
                      <span className="text-xs font-black text-white block truncate">
                        Apply at Checkout
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] sm:text-xs font-black tracking-wide flex items-center gap-1 shrink-0">
                    {isPercentage ? <Percent className="w-3 h-3 shrink-0" /> : <DollarSign className="w-3 h-3 shrink-0" />}
                    <span>{discountLabel}</span>
                  </span>
                </div>

                {/* Voucher Code Display & Copy Action */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-sky-200/90 uppercase tracking-wider block text-left">
                    Click to copy code:
                  </span>

                  <div className="flex items-center justify-between gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl bg-[#07162C] border border-[#0080FF]/35 min-w-0">
                    <span className="font-mono font-black text-base sm:text-xl text-white tracking-wider sm:tracking-widest pl-1.5 sm:pl-2 truncate">
                      {coupon.code}
                    </span>

                    <button
                      type="button"
                      id="cta-copy-code-btn"
                      onClick={handleCopyCode}
                      className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 ${
                        copied
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/40"
                          : "bg-white/15 hover:bg-white/25 text-white border border-white/25"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] sm:text-[11px] text-sky-200/80 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1">
                  <span>Valid for new &amp; ongoing online academy registrations.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
