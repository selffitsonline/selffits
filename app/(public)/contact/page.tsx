import React from "react";
import type { Metadata } from "next";
import { ContactPageClient } from "@/components/public/contact-page-client";
import { JsonLd } from "@/components/seo/json-ld";
import { generateBreadcrumbSchema, SITE_CONFIG } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact Support & Admissions",
  description:
    "Have questions about program enrollment, batch timings, or belt evaluations? Contact SELFFITS Academy support via email, phone, or WhatsApp.",
  alternates: {
    canonical: "https://selffits.com/contact",
  },
  openGraph: {
    title: "Contact SELFFITS Support | Live Virtual Academy",
    description:
      "Get in touch with SELFFITS Academy. Support available for live online classes, enrollments, and international timings.",
    url: "https://selffits.com/contact",
  },
};

export default function ContactPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" },
  ]);

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact SELFFITS Support",
    url: "https://selffits.com/contact",
    description:
      "Contact details and admissions support for SELFFITS Online Fitness & Martial Arts Academy.",
    mainEntity: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.baseUrl,
      email: SITE_CONFIG.email,
      telephone: SITE_CONFIG.telephone,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: SITE_CONFIG.telephone,
        contactType: "customer service",
        email: SITE_CONFIG.email,
        availableLanguage: ["English", "Hindi"],
      },
    },
  };

  return (
    <>
      <JsonLd data={[breadcrumbSchema, contactSchema]} />
      <ContactPageClient />
    </>
  );
}
