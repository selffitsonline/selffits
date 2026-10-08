import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminCouponsAction } from "@/actions/coupons.actions";
import { AdminCouponsView } from "@/components/admin/admin-coupons-view";

export default async function AdminCouponsPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/admin/login?callbackUrl=/admin/coupons");
  }

  const res = await getAdminCouponsAction();
  const initialCoupons = res?.coupons || [];

  return <AdminCouponsView initialCoupons={initialCoupons} />;
}
