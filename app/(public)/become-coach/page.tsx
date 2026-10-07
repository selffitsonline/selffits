import React from "react";
import type { Metadata } from "next";
import { BecomeCoachClient } from "@/components/public/become-coach-form";
import { JsonLd } from "@/components/seo/json-ld";
import { generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Become a SELFFITS Coach | Instructor Careers",
  description:
    "Join the SELFFITS global instructor network. Apply to teach live virtual martial arts and fitness classes to students across 15+ countries.",
  alternates: {
    canonical: "https://selffits.com/become-coach",
  },
  openGraph: {
    title: "Become a SELFFITS Coach | Join Our Global Faculty",
    description:
      "Apply to become a certified martial arts or fitness coach at SELFFITS Academy. Live interactive classes worldwide.",
    url: "https://selffits.com/become-coach",
  },
};

export default function BecomeCoachPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Become a Coach", url: "/become-coach" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <BecomeCoachClient />
    </>
  );
}
