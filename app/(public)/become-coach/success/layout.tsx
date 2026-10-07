import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Received",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BecomeCoachSuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
