export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { CoachesCarousel } from "@/components/public/coaches-carousel";
import { getAdminHomepageManagementAction } from "@/actions/admin.actions";
import { Award, Sparkles, ArrowRight } from "lucide-react";

export default async function CoachesPage() {
  const res = await getAdminHomepageManagementAction();
  const coachesItems = res && res.success ? res.homepageData?.coaches?.items : undefined;

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
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
                🏆
              </div>
              <h3 className="text-base font-bold text-white">Global Belt Accreditation</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Structured belt rank graduation certificates issued directly under head master supervision.
              </p>
            </div>
          </div>
        </section>

        {/* BECOME A SELFFITS COACH CTA BANNER */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-8 sm:p-12 bg-[#0A0B0E] border border-white/15 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-[#E50914]/15 to-[#0080FF]/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E50914]/10 text-[#E50914] text-xs font-bold border border-[#E50914]/30 uppercase tracking-widest">
                <Award className="w-3.5 h-3.5" />
                Instructor Recruitment
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-[family-name:var(--font-outfit)] tracking-tight uppercase">
                BECOME A SELFFITS COACH
              </h2>
            </div>

            <p className="relative z-10 text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
              Are you a qualified fitness or martial arts instructor? Join SELFFITS and share your expertise with students from around the world.
            </p>

            <div className="relative z-10 pt-2">
              <Link
                href="/become-coach"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-black text-sm sm:text-base uppercase tracking-wider hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/30 inline-flex items-center gap-2"
              >
                BECOME A COACH <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
