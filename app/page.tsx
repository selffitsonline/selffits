export const dynamic = "force-dynamic";

import React from "react";
import type { Metadata } from "next";
import { getAdminHomepageManagementAction, getAdminMenuItemsAction } from "@/actions/admin.actions";
import { HomePageClient } from "@/components/public/home-page-client";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_CONFIG } from "@/lib/seo";

export const metadata: Metadata = {
  title: "SELFFITS | Global Online Fitness & Martial Arts Academy",
  description:
    "Train anywhere and transform yourself with SELFFITS Academy. Live interactive Martial Arts & Fitness classes for Kids, Adults, and Ladies Only batches via Google Meet & Zoom.",
  alternates: {
    canonical: "https://selffits.com",
  },
  openGraph: {
    title: "SELFFITS | Global Online Fitness & Martial Arts Academy",
    description:
      "Train anywhere and transform yourself. Join live interactive Martial Arts & Fitness classes worldwide with certified instructors.",
    url: "https://selffits.com",
  },
};

export default async function HomePage() {
  const [res, menuRes] = await Promise.all([
    getAdminHomepageManagementAction(),
    getAdminMenuItemsAction(),
  ]);
  const homepageData = res && res.success ? res.homepageData : null;
  const initialNavItems = menuRes && menuRes.success && Array.isArray(menuRes.headerMenu)
    ? menuRes.headerMenu.filter((i: any) => i.isEnabled).map((i: any) => ({ name: i.label, href: i.href }))
    : undefined;

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "SportsClub",
    "@id": "https://selffits.com/#academy",
    name: "SELFFITS Academy",
    description: SITE_CONFIG.defaultDescription,
    url: "https://selffits.com",
    logo: "https://selffits.com/logo-updated.jpg",
    image: "https://selffits.com/logo-updated.jpg",
    telephone: SITE_CONFIG.telephone,
    email: SITE_CONFIG.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_CONFIG.address.city,
      addressRegion: SITE_CONFIG.address.region,
      addressCountry: SITE_CONFIG.address.countryCode,
    },
    sameAs: Object.values(SITE_CONFIG.socials),
    priceRange: "$$",
  };

  return (
    <>
      <JsonLd data={localBusinessSchema} />
      <HomePageClient initialData={homepageData} initialNavItems={initialNavItems} />
    </>
  );
}
