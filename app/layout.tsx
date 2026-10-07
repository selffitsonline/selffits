import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "@/components/providers/global-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A0B0E",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://selffits.com"),
  title: {
    default: "SELFFITS | Global Online Fitness & Martial Arts Academy",
    template: "%s | SELFFITS Academy",
  },
  description:
    "Train Anywhere. Transform Yourself. Join live online Martial Arts & Fitness classes worldwide through Google Meet & Zoom with certified instructors.",
  keywords: [
    "Martial Arts",
    "Online Fitness",
    "Live Classes",
    "Kids Martial Arts",
    "Adults Martial Arts",
    "Ladies Only Fitness",
    "Weight Loss Challenge",
    "HIIT Workout",
    "SELFFITS",
    "Online Karate Classes",
    "Virtual Martial Arts Academy",
  ],
  alternates: {
    canonical: "https://selffits.com",
  },
  icons: {
    icon: "/logo-updated.jpg",
    shortcut: "/logo-updated.jpg",
    apple: "/logo-updated.jpg",
  },
  openGraph: {
    title: "SELFFITS | Global Online Fitness & Martial Arts Academy",
    description:
      "Train anywhere with certified instructors. Real-time form correction, belt progression, and live virtual classes for kids, adults, and women.",
    url: "https://selffits.com",
    siteName: "SELFFITS Academy",
    images: [
      {
        url: "/logo-updated.jpg",
        width: 800,
        height: 600,
        alt: "SELFFITS - Global Online Fitness & Martial Arts Academy",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SELFFITS | Global Online Fitness & Martial Arts Academy",
    description:
      "Train anywhere with certified instructors. Real-time form correction, belt progression, and live virtual classes.",
    images: ["/logo-updated.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <JsonLd data={[orgSchema, webSiteSchema]} />
      </head>
      <body
        className={`${inter.className} bg-[#0A0B0E] text-white antialiased selection:bg-[#E50914] selection:text-white overflow-x-hidden`}
        suppressHydrationWarning
      >
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  );
}
