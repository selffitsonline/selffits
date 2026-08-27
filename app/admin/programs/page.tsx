export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminProgramsView } from "@/components/admin/admin-programs-view";

export default async function AdminProgramsPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/admin/login?callbackUrl=/admin/programs");
  }

  return <AdminProgramsView />;
}
