import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export const metadata: Metadata = {
  title: "Student Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const role = session.user.role;
  if (role === Role.COACH) {
    redirect("/coach/dashboard");
  } else if (role === Role.ADMIN || role === Role.SUPER_ADMIN) {
    redirect("/admin/dashboard");
  }

  return <>{children}</>;
}
