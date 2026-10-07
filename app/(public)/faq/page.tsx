import React from "react";
import type { Metadata } from "next";
import { FAQPageClient } from "@/components/public/faq-page-client";
import { JsonLd } from "@/components/seo/json-ld";
import { generateBreadcrumbSchema, generateFAQPageSchema, SELFFITS_FAQS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers about SELFFITS online martial arts classes, live Zoom & Google Meet batches, belt certifications, pricing, and required equipment.",
  alternates: {
    canonical: "https://selffits.com/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions | SELFFITS Academy",
    description:
      "Quick answers about live virtual classes, belt evaluations, schedules, and payment options.",
    url: "https://selffits.com/faq",
  },
};

export default function FAQPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "FAQ", url: "/faq" },
  ]);

  const faqSchema = generateFAQPageSchema(SELFFITS_FAQS);

  return (
    <>
      <JsonLd data={[breadcrumbSchema, faqSchema]} />
      <FAQPageClient />
    </>
  );
}
