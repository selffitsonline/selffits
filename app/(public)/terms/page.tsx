import React from "react";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-4xl font-black font-[family-name:var(--font-outfit)] text-white">
            Terms of Service
          </h1>
          <p className="text-xs text-gray-400">Last updated: August 2026</p>

          <div className="space-y-6 text-sm text-gray-300 leading-relaxed border-t border-white/10 pt-6">
            <h2 className="text-lg font-bold text-white">1. Membership & Program Access</h2>
            <p>
              By enrolling in SELFFITS Academy, students receive access to live online sessions (Google Meet / Zoom) for the duration and class count specified in their purchased tier.
            </p>

            <h2 className="text-lg font-bold text-white">2. Live Class Conduct</h2>
            <p>
              Students are expected to maintain martial arts discipline, respect instructors and fellow classmates, and ensure a clear, safe physical environment at home during live workouts.
            </p>

            <h2 className="text-lg font-bold text-white">3. Belt Certification Standards</h2>
            <p>
              Official Belt Certificates are awarded upon completing the required class count and passing the live virtual belt rank evaluation administered by SELFFITS master senseis.
            </p>

            <h2 className="text-lg font-bold text-white">4. Refund Policy</h2>
            <p>
              Membership subscriptions are non-refundable once class access has commenced, except in cases of double-billing or documented technical issues on our platform.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
