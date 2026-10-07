export const SITE_CONFIG = {
  name: "SELFFITS Academy",
  shortName: "SELFFITS",
  legalName: "SELFFITS Academy",
  domain: "selffits.com",
  baseUrl: "https://selffits.com",
  defaultTitle: "SELFFITS | Live Online Martial Arts & Fitness Academy",
  titleTemplate: "%s | SELFFITS Academy",
  defaultDescription:
    "Train anywhere and transform yourself with SELFFITS Academy. Live interactive Martial Arts & Fitness classes for Kids, Adults, and Ladies Only batches via Google Meet & Zoom.",
  email: "support@selffits.com",
  telephone: "+91-98470-12345",
  telephoneDisplay: "+91 98470 12345",
  address: {
    city: "Bengaluru",
    region: "Karnataka",
    country: "India",
    countryCode: "IN",
  },
  socials: {
    instagram: "https://instagram.com/selffits",
    facebook: "https://facebook.com/selffits",
    youtube: "https://youtube.com/@selffits",
    linkedin: "https://linkedin.com/company/selffits",
  },
  defaultOgImage: {
    url: "/logo-updated.jpg",
    width: 800,
    height: 600,
    alt: "SELFFITS - Global Online Fitness & Martial Arts Academy",
  },
};

export function absoluteUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_CONFIG.baseUrl}${cleanPath === "/" ? "" : cleanPath}`;
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "@id": `${SITE_CONFIG.baseUrl}/#organization`,
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.shortName,
    url: SITE_CONFIG.baseUrl,
    logo: absoluteUrl(SITE_CONFIG.defaultOgImage.url),
    image: absoluteUrl(SITE_CONFIG.defaultOgImage.url),
    description: SITE_CONFIG.defaultDescription,
    email: SITE_CONFIG.email,
    telephone: SITE_CONFIG.telephone,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_CONFIG.address.city,
      addressRegion: SITE_CONFIG.address.region,
      addressCountry: SITE_CONFIG.address.countryCode,
    },
    sameAs: Object.values(SITE_CONFIG.socials),
    priceRange: "$$",
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.baseUrl}/#website`,
    url: SITE_CONFIG.baseUrl,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.defaultDescription,
    publisher: {
      "@id": `${SITE_CONFIG.baseUrl}/#organization`,
    },
    inLanguage: "en-US",
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : absoluteUrl(item.url),
    })),
  };
}

export const SELFFITS_FAQS = [
  {
    question: "How do live online classes work at SELFFITS?",
    answer:
      "All classes are held live over Google Meet or Zoom. Once you enroll, you get instant access to your Student Dashboard where today's active live link is displayed 15 minutes before class time. Simply click 'Join Class' to enter your session.",
  },
  {
    question: "Do I need prior martial arts experience or special equipment?",
    answer:
      "No prior experience is required! Our programs are designed for all levels from complete beginners to advanced practitioners. Basic comfortable athletic clothing and a clear 6x6 ft space at home is all you need to start.",
  },
  {
    question: "Can kids and adults take classes together?",
    answer:
      "We maintain separate dedicated batches tailored to different age groups and needs: Kids Martial Arts (Ages 8-20), Adults Martial Arts (21+), and Ladies Only Programs.",
  },
  {
    question: "How are Belt Certifications issued?",
    answer:
      "Upon completing your required class count and passing your live virtual belt evaluation with Sensei, official Belt Certificates are uploaded directly to your Student Dashboard for high-resolution download.",
  },
  {
    question: "What payment methods do you support?",
    answer:
      "We support all major payment options globally via Razorpay, including Indian UPI, Credit/Debit Cards, Netbanking, and International Multi-Currency (USD/INR) credit cards.",
  },
  {
    question: "What happens if I miss a live class?",
    answer:
      "Class credits remain valid within your active subscription duration. You can easily attend another scheduled batch during the week.",
  },
];

export function generateFAQPageSchema(faqs: { question: string; answer: string }[] = SELFFITS_FAQS) {
  const safeFaqs = Array.isArray(faqs) ? faqs : SELFFITS_FAQS;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: safeFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

