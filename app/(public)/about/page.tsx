export const dynamic = "force-dynamic";

import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import {
  ShieldCheck,
  Video,
  Award,
  Heart,
  CheckCircle2,
  Sparkles,
  Users,
  Flame,
  Zap,
  BookOpen,
  Star,
  Target,
} from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { generateBreadcrumbSchema } from "@/lib/seo";
import { getAdminMenuItemsAction } from "@/actions/admin.actions";
import { getAboutPageConfigAction } from "@/actions/about.actions";
import { DEFAULT_ABOUT_PAGE_CONFIG } from "@/lib/about-config";

function getPillarLucideIcon(iconName: string) {
  switch (iconName) {
    case "Video":
      return Video;
    case "ShieldCheck":
      return ShieldCheck;
    case "Award":
      return Award;
    case "Heart":
      return Heart;
    case "Sparkles":
      return Sparkles;
    case "Users":
      return Users;
    case "Flame":
      return Flame;
    case "Zap":
      return Zap;
    case "CheckCircle2":
      return CheckCircle2;
    case "Star":
      return Star;
    case "Target":
      return Target;
    case "BookOpen":
      return BookOpen;
    default:
      return Award;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const aboutRes = await getAboutPageConfigAction();
  const config = aboutRes?.config || DEFAULT_ABOUT_PAGE_CONFIG;
  const description =
    config.hero.subtitle ||
    "Democratizing authentic martial arts & high-intensity fitness training globally through real-time virtual classrooms with certified black belt senseis.";

  return {
    title: "About Us",
    description,
    alternates: {
      canonical: "https://selffits.com/about",
    },
    openGraph: {
      title: `${config.hero.heading || "About Us"} | SELFFITS Academy`,
      description,
      url: "https://selffits.com/about",
    },
  };
}

export default async function AboutPage() {
  const [menuRes, aboutRes] = await Promise.all([
    getAdminMenuItemsAction(),
    getAboutPageConfigAction(),
  ]);

  const initialNavItems =
    menuRes && menuRes.success && Array.isArray(menuRes.headerMenu)
      ? menuRes.headerMenu
          .filter((i: any) => i.isEnabled)
          .map((i: any) => ({ name: i.label, href: i.href }))
      : undefined;

  const about = aboutRes?.config || DEFAULT_ABOUT_PAGE_CONFIG;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
  ]);

  const isExternalImage =
    about.story.imageUrl?.startsWith("http") ||
    about.story.imageUrl?.startsWith("data:");

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <JsonLd data={breadcrumbSchema} />
      <Header initialNavItems={initialNavItems} />

      <main className="flex-grow pt-28 pb-20">
        {/* Page Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-16">
          {about.hero.badge && (
            <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
              {about.hero.badge}
            </span>
          )}
          <h1 className="text-4xl sm:text-6xl font-black font-[family-name:var(--font-outfit)]">
            {about.hero.heading}
          </h1>
          {about.hero.subtitle && (
            <p className="text-gray-400 text-base max-w-2xl mx-auto">
              {about.hero.subtitle}
            </p>
          )}
        </section>

        {/* Story Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold font-[family-name:var(--font-outfit)] text-white">
              {about.story.heading}
            </h2>

            {about.story.paragraphs.map((paragraph, idx) => (
              <p key={idx} className="text-gray-300 text-sm leading-relaxed">
                {paragraph}
              </p>
            ))}

            {about.story.features && about.story.features.length > 0 && (
              <div className="space-y-3 pt-2">
                {about.story.features.map((feature, idx) => (
                  <div
                    key={feature.id || idx}
                    className="flex items-center gap-3 text-sm font-semibold text-white"
                  >
                    <CheckCircle2
                      className="w-5 h-5 shrink-0"
                      style={{ color: feature.color || "#E50914" }}
                    />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src={about.story.imageUrl || "/images/adults_martial_arts.png"}
              alt={
                about.story.imageAlt ||
                "SELFFITS Master Martial Arts Instructor teaching live class"
              }
              width={600}
              height={450}
              unoptimized={isExternalImage}
              className="w-full h-[400px] object-cover"
            />
          </div>
        </section>

        {/* Pillars Section */}
        <section className="bg-[#0E1015] border-y border-white/10 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl font-extrabold font-[family-name:var(--font-outfit)]">
                {about.pillars.heading}
              </h2>
              {about.pillars.subtitle && (
                <p className="text-gray-400 text-sm max-w-xl mx-auto">
                  {about.pillars.subtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {about.pillars.items.map((pillar, idx) => {
                const IconComponent = getPillarLucideIcon(pillar.icon);
                const iconColor = pillar.color || "#0080FF";

                return (
                  <div
                    key={pillar.id || idx}
                    className="bg-[#14161D] border border-white/10 p-6 rounded-2xl space-y-3"
                  >
                    <IconComponent
                      className="w-8 h-8"
                      style={{ color: iconColor }}
                    />
                    <h3 className="text-lg font-bold text-white">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 text-center px-4">
          <Link
            href={about.cta.buttonLink || "/programs"}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF1E27] text-white font-bold text-base hover:opacity-95 transition-all shadow-xl shadow-[#E50914]/25 inline-block"
          >
            {about.cta.buttonText || "Start Your Training Today"}
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
