import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminCoachesAction } from "@/actions/admin.actions";
import { AdminCoachesView } from "@/components/admin/admin-coaches-view";

export default async function AdminCoachesPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/admin/login?callbackUrl=/admin/coaches");
  }

  const res = await getAdminCoachesAction();
  const initialCoaches = res?.coaches || [];

  return <AdminCoachesView initialCoaches={initialCoaches} />;
}
