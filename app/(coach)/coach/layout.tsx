import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coach Portal",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CoachPortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
