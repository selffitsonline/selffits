"use client";

import React, { useState } from "react";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { FAQAccordion } from "@/components/public/faq-accordion";
import { Search } from "lucide-react";
import { SELFFITS_FAQS } from "@/lib/seo";

export function FAQPageClient() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = SELFFITS_FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0080FF]">
            Help Center
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-[family-name:var(--font-outfit)]">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 text-base max-w-2xl mx-auto">
            Find quick answers to common questions regarding live classes, belt certifications, and payment options.
          </p>

          <div className="max-w-md mx-auto pt-4 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions (e.g., certification, zoom, equipment)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#14161D] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] transition-colors"
            />
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6">
          <FAQAccordion items={filteredFaqs} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
