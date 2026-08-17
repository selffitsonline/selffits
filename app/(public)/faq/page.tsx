"use client";

import React, { useState } from "react";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { FAQAccordion } from "@/components/public/faq-accordion";
import { Search } from "lucide-react";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const allFaqs = [
    {
      question: "How do live online classes work at SELFFITS?",
      answer: "All classes are held live over Google Meet or Zoom. Once you enroll, you get instant access to your Student Dashboard where today's active live link is displayed 15 minutes before class time. Simply click 'Join Class' to enter your session.",
    },
    {
      question: "Do I need prior martial arts experience or special equipment?",
      answer: "No prior experience is required! Our programs are designed for all levels from complete beginners to advanced practitioners. Basic comfortable athletic clothing and a clear 6x6 ft space at home is all you need to start.",
    },
    {
      question: "Can kids and adults take classes together?",
      answer: "We maintain separate dedicated batches tailored to different age groups and needs: Kids Martial Arts (Ages 8-20), Adults Martial Arts (21+), and Ladies Only Programs.",
    },
    {
      question: "How are Belt Certifications issued?",
      answer: "Upon completing your required class count and passing your live virtual belt evaluation with Sensei, official Belt Certificates are uploaded directly to your Student Dashboard for high-resolution download.",
    },
    {
      question: "What payment methods do you support?",
      answer: "We support all major payment options globally via Razorpay, including Indian UPI, Credit/Debit Cards, Netbanking, and International Multi-Currency (USD/INR) credit cards.",
    },
    {
      question: "What happens if I miss a live class?",
      answer: "Class credits remain valid within your active subscription duration. You can easily attend another scheduled batch during the week.",
    },
  ];

  const filteredFaqs = allFaqs.filter(
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

          {/* Search Input */}
          <div className="max-w-md mx-auto relative pt-4">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#14161D] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#0080FF]"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-7" />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQAccordion items={filteredFaqs} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
