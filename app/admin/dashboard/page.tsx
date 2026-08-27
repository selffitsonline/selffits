import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminDashboardStatsAction } from "@/actions/admin.actions";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/admin/login?callbackUrl=/admin/dashboard");
  }

  const res = await getAdminDashboardStatsAction();
  const initialStats = res?.stats || {};

  return <AdminDashboardView initialStats={initialStats} />;
}
