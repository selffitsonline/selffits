import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminCoachApplicationsAction } from "@/actions/admin.actions";
import { AdminCoachApplicationsView } from "@/components/admin/admin-coach-applications-view";

export default async function AdminCoachApplicationsPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/admin/login?callbackUrl=/admin/coach-applications");
  }

  const res = await getAdminCoachApplicationsAction();
  const initialApplications = res?.applications || [];

  return <AdminCoachApplicationsView initialApplications={initialApplications} />;
}
