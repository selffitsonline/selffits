import React from "react";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-4xl font-black font-[family-name:var(--font-outfit)] text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-400">Last updated: August 2026</p>

          <div className="space-y-6 text-sm text-gray-300 leading-relaxed border-t border-white/10 pt-6">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              SELFFITS collects personal information provided directly by users during registration, enrollment, and payment. This includes student names, email addresses, phone numbers, country of residence, and payment transactions via Razorpay.
            </p>

            <h2 className="text-lg font-bold text-white">2. How We Use Information</h2>
            <p>
              Your information is strictly used to deliver live virtual classes, provision dashboard access, issue official belt certificates, send transactional email notifications, and process membership payments.
            </p>

            <h2 className="text-lg font-bold text-white">3. Data Security & Storage</h2>
            <p>
              We implement industry-standard encryption protocols (TLS 1.3) and secure authentication via NextAuth. We never sell, rent, or share user personal data with third-party marketers.
            </p>

            <h2 className="text-lg font-bold text-white">4. Payment Processing</h2>
            <p>
              All financial transactions are handled securely by Razorpay. SELFFITS does not store raw credit/debit card numbers or banking passwords on our servers.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
