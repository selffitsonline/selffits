export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminAboutView } from "@/components/admin/admin-about-view";
import { getAboutPageConfigAction } from "@/actions/about.actions";

export const metadata: Metadata = {
  title: "About Us Management | Admin Panel",
  description: "Manage and publish content for the SELFFITS About Us page.",
};

export default async function AdminAboutPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/admin/login?callbackUrl=/admin/about");
  }

  const res = await getAboutPageConfigAction();

  return (
    <AdminShell>
      <AdminAboutView initialConfig={res.config} />
    </AdminShell>
  );
}
