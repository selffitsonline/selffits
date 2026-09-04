import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "@/components/providers/global-provider";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "SELFFITS | Global Online Fitness & Martial Arts Academy",
    template: "%s | SELFFITS Academy",
  },
  description:
    "Train Anywhere. Transform Yourself. Join live online Martial Arts & Fitness classes worldwide through Google Meet & Zoom.",
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
  ],
  icons: {
    icon: "/logo-updated.jpg",
    shortcut: "/logo-updated.jpg",
    apple: "/logo-updated.jpg",
  },
  openGraph: {
    title: "SELFFITS - Global Online Fitness & Martial Arts Academy",
    description: "Train Anywhere. Transform Yourself. Live stream fitness & belt progression.",
    url: "https://selffits.com",
    siteName: "SELFFITS Academy",
    images: [
      {
        url: "/logo-updated.jpg",
        width: 800,
        height: 600,
        alt: "SELFFITS Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body
        className={`${inter.className} bg-[#0A0B0E] text-white antialiased selection:bg-[#E50914] selection:text-white overflow-x-hidden`}
        suppressHydrationWarning
      >
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  );
}
