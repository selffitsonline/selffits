"use client";

import React, { useState } from "react";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
            Get In Touch
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-[family-name:var(--font-outfit)]">
            Contact SELFFITS Support
          </h1>
          <p className="text-gray-400 text-base max-w-2xl mx-auto">
            Have questions about program enrollment, batch timings, or belt evaluations? Our support team is here to assist you.
          </p>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Details Column */}
          <div className="space-y-8 bg-[#14161D] border border-white/10 p-8 rounded-3xl">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-white">
              Academy Support Info
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Email Us</h4>
                  <p className="text-xs text-gray-400">Response SLA within 24 hours</p>
                  <p className="text-sm text-[#0080FF] font-semibold mt-1">support@selffits.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">WhatsApp Quick Chat</h4>
                  <p className="text-xs text-gray-400">Available 9:00 AM - 9:00 PM IST</p>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-[#10B981] text-black font-bold text-xs hover:opacity-90 transition-opacity"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0080FF]/15 border border-[#0080FF]/30 flex items-center justify-center text-[#0080FF] shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Global Headquarters</h4>
                  <p className="text-xs text-gray-400 leading-relaxed mt-1">
                    SELFFITS Global Online Academy, Headquarters Bengaluru, Karnataka, India. Serving students across USA, UK, UAE, Europe, and Asia.
                  </p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="w-full h-48 rounded-xl bg-[#0F1117] border border-white/10 flex flex-col items-center justify-center text-center p-4">
              <MapPin className="w-8 h-8 text-[#E50914] mb-2" />
              <p className="text-xs text-gray-300 font-semibold">SELFFITS Virtual Academy Network</p>
              <p className="text-[11px] text-gray-500">Google Meet & Zoom Streams Live Worldwide</p>
            </div>
          </div>

          {/* Form Column */}
          <div className="bg-[#14161D] border border-white/10 p-8 rounded-3xl">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-white mb-6">
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto" />
                <h3 className="text-xl font-bold text-white">Message Sent Successfully</h3>
                <p className="text-xs text-gray-300">
                  Thank you for reaching out! Our admissions team will respond to your email within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    Your Message / Question
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us which program or batch timing you're interested in..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-4 rounded-xl bg-[#0F1117] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-bold text-sm hover:opacity-95 transition-opacity shadow-lg shadow-[#E50914]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
