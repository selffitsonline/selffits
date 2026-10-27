import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export const metadata: Metadata = {
  title: "Coach Portal",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CoachPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== Role.COACH && role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
