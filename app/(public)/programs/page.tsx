export const dynamic = "force-dynamic";

import React from "react";
import type { Metadata } from "next";
import { ProgramsPageClient } from "@/components/public/programs-page-client";
import { JsonLd } from "@/components/seo/json-ld";
import { generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Live Online Martial Arts & Fitness Programs",
  description:
    "Explore interactive live online classes for Kids Martial Arts (Ages 8-20), Adults Karate & Self Defense, Ladies Only Fitness, and Weight Loss HIIT over Zoom with certified coaches.",
  alternates: {
    canonical: "https://selffits.com/programs",
  },
  openGraph: {
    title: "Martial Arts & Fitness Programs | SELFFITS Academy",
    description:
      "Interactive live online martial arts and fitness classes with real-time form correction, belt certifications, and flexible GMT batch timings.",
    url: "https://selffits.com/programs",
  },
};

import { getAdminMenuItemsAction } from "@/actions/admin.actions";

export default async function ProgramsPage() {
  const menuRes = await getAdminMenuItemsAction();
  const initialNavItems = menuRes && menuRes.success && Array.isArray(menuRes.headerMenu)
    ? menuRes.headerMenu.filter((i: any) => i.isEnabled).map((i: any) => ({ name: i.label, href: i.href }))
    : undefined;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Programs", url: "/programs" },
  ]);

  const courseListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "Course",
        position: 1,
        name: "Kids Martial Arts (Ages 8-20)",
        description:
          "Live interactive martial arts training for kids covering discipline, self-defense basics, kata forms, and belt rank progression.",
        provider: {
          "@type": "Organization",
          name: "SELFFITS Academy",
          sameAs: "https://selffits.com",
        },
      },
      {
        "@type": "Course",
        position: 2,
        name: "Adult Martial Arts & Karate (Ages 21+)",
        description:
          "Authentic martial arts, strike combinations, physical conditioning, and live form correction from certified black belt instructors.",
        provider: {
          "@type": "Organization",
          name: "SELFFITS Academy",
          sameAs: "https://selffits.com",
        },
      },
      {
        "@type": "Course",
        position: 3,
        name: "Ladies Only Fitness & Self Defense",
        description:
          "Female-tailored high energy fitness workouts, fat burning drills, and practical self-defense techniques in a dedicated, supportive environment.",
        provider: {
          "@type": "Organization",
          name: "SELFFITS Academy",
          sameAs: "https://selffits.com",
        },
      },
      {
        "@type": "Course",
        position: 4,
        name: "Fitness & Weight Management (HIIT)",
        description:
          "High intensity interval training designed for sustainable fat loss, stamina enhancement, core strength, and cardiovascular health.",
        provider: {
          "@type": "Organization",
          name: "SELFFITS Academy",
          sameAs: "https://selffits.com",
        },
      },
    ],
  };

  return (
    <>
      <JsonLd data={[breadcrumbSchema, courseListSchema]} />
      <ProgramsPageClient initialNavItems={initialNavItems} />
    </>
  );
}
