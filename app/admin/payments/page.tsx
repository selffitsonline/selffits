import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminPaymentsAction } from "@/actions/admin.actions";
import { AdminPaymentsView } from "@/components/admin/admin-payments-view";

export default async function AdminPaymentsPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/admin/login?callbackUrl=/admin/payments");
  }

  const res = await getAdminPaymentsAction();
  const initialPayments = res?.payments || [];

  return <AdminPaymentsView initialPayments={initialPayments} />;
}
