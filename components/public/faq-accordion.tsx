"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

const defaultFaqs: FAQItem[] = [
  {
    question: "How do live online classes work at SELFFITS?",
    answer:
      "All classes are held live over Zoom Classes. Once you enroll, you get instant access to your Student Dashboard where today's active live link is displayed 15 minutes before class time. Simply click 'Join Class' to enter your session.",
  },
  {
    question: "Do I need prior martial arts experience or special equipment?",
    answer:
      "No prior experience is required! Our programs are designed for all levels from complete beginners to advanced practitioners. Basic comfortable athletic clothing and a clear 6x6 ft space at home is all you need to start.",
  },
  {
    question: "Can kids and adults take classes together?",
    answer:
      "We maintain separate dedicated batches tailored to different age groups and needs: Kids Martial Arts (Ages 8-20), Adults Martial Arts (21+), and Ladies Only Programs.",
  },
  {
    question: "How are Program Completion Certificates issued?",
    answer:
      "Upon completing your required class count and passing your live virtual skills evaluation with Sensei, official Program Completion Certificates are uploaded directly to your Student Dashboard for high-resolution download.",
  },
  {
    question: "What payment methods do you support?",
    answer:
      "We support all major payment options globally via Razorpay, including Indian UPI, Credit/Debit Cards, Netbanking, and International Multi-Currency (USD/INR) credit cards.",
  },
];

export function FAQAccordion({ items = defaultFaqs }: { items?: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="bg-[#14161D] border border-white/10 rounded-xl overflow-hidden transition-colors"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-white hover:text-[#E50914] transition-colors cursor-pointer"
            >
              <span className="text-base font-[family-name:var(--font-outfit)]">
                {item.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-[#E50914]" : ""
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-3">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
