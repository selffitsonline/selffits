"use client";

import React from "react";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { PricingCards } from "@/components/public/pricing-cards";
import { FAQAccordion } from "@/components/public/faq-accordion";

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0080FF]">
            Transparent Pricing
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-[family-name:var(--font-outfit)]">
            Membership Plans & Belt Tiers
          </h1>
          <p className="text-gray-400 text-base max-w-2xl mx-auto">
            Choose your martial arts belt rank (Yellow, Blue, Purple, Brown) or fitness transformation challenge. Instant dashboard access upon enrollment.
          </p>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <PricingCards />
        </section>

        {/* FAQ Section */}
        <section className="bg-[#0E1015] border-t border-white/10 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
                Pricing Questions
              </span>
              <h2 className="text-3xl font-extrabold font-[family-name:var(--font-outfit)]">
                Membership FAQ
              </h2>
            </div>
            <FAQAccordion />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
