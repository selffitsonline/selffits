export const dynamic = "force-dynamic";

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { CoachesCarousel } from "@/components/public/coaches-carousel";
import { getAdminHomepageManagementAction } from "@/actions/admin.actions";
import { Award, Sparkles, ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Master Coaches & Certified Instructors",
  description:
    "Meet our certified 4th Dan black belt instructors and master fitness coaches delivering real-time interactive feedback on Google Meet and Zoom.",
  alternates: {
    canonical: "https://selffits.com/coaches",
  },
  openGraph: {
    title: "Master Coaches | SELFFITS Academy",
    description:
      "Learn from certified black belt instructors with decades of teaching mastery and live form correction.",
    url: "https://selffits.com/coaches",
  },
};

export default async function CoachesPage() {
  const res = await getAdminHomepageManagementAction();
  const coachesItems = res && res.success ? res.homepageData?.coaches?.items : undefined;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Master Coaches", url: "/coaches" },
  ]);

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <JsonLd data={breadcrumbSchema} />
      <Header />

      <main className="flex-grow pt-28 pb-20 space-y-16">
        {/* Header Title Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E50914] inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E50914]/10 border border-[#E50914]/30">
            <Sparkles className="w-3.5 h-3.5" />
            World Class Instructors
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-[family-name:var(--font-outfit)] tracking-tight">
            Meet Our Master Coaches
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Learn from certified black belt instructors and master fitness trainers dedicated to guiding your form and technique in real time.
          </p>
        </section>

        {/* Interactive Coaches Carousel (Server-fetched items) */}
        <section className="py-6">
          <CoachesCarousel items={coachesItems} />
        </section>

        {/* Why Train With Our Master Instructors Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#14161D] border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] mx-auto text-xl font-bold">
                🥋
              </div>
              <h3 className="text-base font-bold text-white">4th Dan Certified</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Authentic black belt lineage with decade-plus virtual & physical teaching mastery.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#0080FF]/15 border border-[#0080FF]/30 flex items-center justify-center text-[#0080FF] mx-auto text-xl font-bold">
                ⚡
              </div>
              <h3 className="text-base font-bold text-white">Real-Time Form Correction</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Live interactive feedback during Google Meet & Zoom sessions for maximum accuracy.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] mx-auto text-xl font-bold">
                🎯
              </div>
              <h3 className="text-base font-bold text-white">Dedicated Evaluation</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Personalized belt progress tests & verifiable academy rank certificates.
              </p>
            </div>
          </div>
        </section>

        {/* Coach Application CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#14161D] to-[#0A0B0E] border border-white/10 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
              Instructor Careers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-outfit)]">
              Are You a Certified Martial Arts Sensei or Elite Trainer?
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
              Join our global faculty of coaches teaching thousands of active students worldwide via live virtual classrooms.
            </p>
            <div className="pt-2">
              <Link
                href="/become-coach"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                Apply to Become a SELFFITS Coach <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
