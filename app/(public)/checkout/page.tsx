"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { RazorpayCheckout } from "@/components/public/razorpay-checkout";
import { Check, Calendar, Clock, Sparkles, Tag } from "lucide-react";
import { validateCouponAction } from "@/actions/coupons.actions";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "blue-belt";
  const freqParam = searchParams.get("freq") || "3";
  const daysParam = searchParams.get("days") || "Sunday,Wednesday,Saturday";
  const batchParam = searchParams.get("batch") || "2nd Batch — 02:30 PM to 03:30 PM (GMT)";
  const priceParam = searchParams.get("price") || "55";
  const martialArtsTypeParam = searchParams.get("type") || searchParams.get("martialArtsType") || "";

  const dietAddonParam = searchParams.get("dietAddon") === "true";
  const dietPriceParam = parseFloat(searchParams.get("dietPrice") || "10") || 10;

  const daysPerWeek = parseInt(freqParam, 10) || 3;
  const selectedDays = daysParam.split(",").map((d) => d.trim()).filter(Boolean);
  const selectedBatch = batchParam;
  const priceNum = parseFloat(priceParam) || 55;

  const planName = `${daysPerWeek} ${daysPerWeek === 1 ? "Day" : "Days"} / Week Membership Plan`;

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponCodeInput.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const res = await validateCouponAction({
        code: couponCodeInput.trim(),
        currentAmount: priceNum,
      });

      if (res.success && res.coupon) {
        setAppliedCoupon({
          code: res.coupon.code,
          discountType: res.coupon.discountType,
          discountValue: res.coupon.discountValue,
          discountAmount: res.discountAmount || 0,
          finalAmount: res.finalAmount !== undefined ? res.finalAmount : priceNum,
        });
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponError(res.error || "Invalid coupon code.");
      }
    } catch {
      setCouponError("Unable to validate coupon code at this time.");
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    setCouponError(null);
  };

  return (
    <main className="flex-grow pt-28 pb-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-[#E50914] px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/30">
          Secure Student Enrollment Checkout
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-[family-name:var(--font-outfit)]">
          Complete Your Academy Enrollment
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Confirm your training schedule selection and proceed to secure checkout.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Order & Schedule Summary Column */}
        <div className="bg-[#14161D] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white font-[family-name:var(--font-outfit)]">
              Enrollment Summary
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-[#0080FF]/15 text-[#0080FF] border border-[#0080FF]/30 text-xs font-bold">
              Central Schedule Configured
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between text-sm">
              <span className="text-gray-400 font-semibold">Selected Membership Plan:</span>
              <span className="font-extrabold text-white text-right">{planName}</span>
            </div>

            {martialArtsTypeParam && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-400 font-semibold">Martial Arts Type:</span>
                <span className="font-extrabold text-[#E50914] text-right">
                  {martialArtsTypeParam}
                </span>
              </div>
            )}

            <div className="flex items-start justify-between text-sm">
              <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0080FF]" /> Weekly Training Days:
              </span>
              <span className="font-extrabold text-[#0080FF] text-right">
                {selectedDays.join(", ")}
              </span>
            </div>

            <div className="flex items-start justify-between text-sm">
              <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#10B981]" /> Preferred Batch Timing:
              </span>
              <span className="font-extrabold text-white text-right max-w-[200px]">
                {selectedBatch}
              </span>
            </div>

            {dietAddonParam && (
              <div className="flex items-start justify-between text-sm p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Diet & Nutrition Program Add-on:
                </span>
                <span className="font-black text-emerald-400 text-right">
                  +${dietPriceParam}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
              <span className="text-gray-400 font-semibold">Timezone Standard:</span>
              <span className="font-bold text-gray-200">GMT (UTC+0)</span>
            </div>

            {/* Coupon Code Input Section */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <label htmlFor="coupon-code-input" className="text-xs font-bold text-gray-300 block">
                Coupon Code
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-white tracking-wider">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[11px] text-emerald-400 block font-semibold">
                        ✓ Coupon applied (-${appliedCoupon.discountAmount.toFixed(2)})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      id="coupon-code-input"
                      type="text"
                      placeholder="Enter code"
                      value={couponCodeInput}
                      onChange={(e) => {
                        setCouponCodeInput(e.target.value);
                        if (couponError) setCouponError(null);
                      }}
                      className="flex-grow h-10 px-3.5 rounded-xl bg-[#0F1117] border border-white/15 text-white placeholder-gray-500 text-xs uppercase tracking-wider focus:outline-none focus:border-[#0080FF] transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponCodeInput.trim()}
                      className="px-4 h-10 rounded-xl bg-[#0080FF] hover:bg-[#0060DF] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {isApplyingCoupon ? "Applying..." : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-400 font-semibold pt-0.5">
                      {couponError}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Price Breakdown with/without Coupon */}
            {appliedCoupon ? (
              <div className="space-y-2 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-semibold">Original Price:</span>
                  <span className="font-bold text-gray-300">${priceNum.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Coupon:
                  </span>
                  <span className="font-extrabold text-emerald-400">{appliedCoupon.code}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-400 font-semibold">Discount:</span>
                  <span className="font-extrabold text-emerald-400">-${appliedCoupon.discountAmount.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                  <span className="text-white font-extrabold">Total:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
                      ${appliedCoupon.finalAmount.toFixed(2)}
                    </span>
                    {!dietAddonParam && <span className="text-xs text-gray-400 font-normal"> / month</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                <span className="text-gray-400 font-semibold">Total:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white font-[family-name:var(--font-outfit)]">
                    ${priceNum}
                  </span>
                  {!dietAddonParam && <span className="text-xs text-gray-400 font-normal"> / month</span>}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E50914]" /> Included in Your Membership:
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981]" /> 100% Live Virtual Classroom Sessions
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981]" /> Real-Time Form Correction & Mentorship
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981]" /> Official Belt Graduation Certification
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981]" /> Access to Student Dashboard & Timetables
              </li>
              {dietAddonParam && (
                <li className="flex items-center gap-2 font-bold text-emerald-400">
                  <Check className="w-4 h-4 text-[#10B981]" /> Diet & Nutrition Program PDF Download Access
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Payment Gateway Form Column */}
        <div>
          <RazorpayCheckout
            planId={planId}
            planName={planName}
            priceUSD={appliedCoupon ? appliedCoupon.finalAmount : priceNum}
            couponCode={appliedCoupon ? appliedCoupon.code : undefined}
            originalPriceUSD={priceNum}
            discountAmountUSD={appliedCoupon ? appliedCoupon.discountAmount : 0}
            scheduleData={{
              daysPerWeek,
              selectedDays,
              selectedBatch,
              monthlyPrice: appliedCoupon ? appliedCoupon.finalAmount : priceNum,
              couponCode: appliedCoupon ? appliedCoupon.code : undefined,
              timezone: "GMT (UTC+0)",
              includeDietNutrition: dietAddonParam,
              dietNutritionPrice: dietPriceParam,
              martialArtsType: martialArtsTypeParam || undefined,
            }}
          />
        </div>
      </section>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />
      <Suspense fallback={<div className="pt-32 text-center text-white font-bold">Loading checkout details...</div>}>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </div>
  );
}
