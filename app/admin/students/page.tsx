import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminStudentsAction } from "@/actions/admin.actions";
import { AdminStudentsView } from "@/components/admin/admin-students-view";

export default async function AdminStudentsPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/admin/login?callbackUrl=/admin/students");
  }

  const res = await getAdminStudentsAction();
  const initialStudents = res?.students || [];

  return <AdminStudentsView initialStudents={initialStudents} />;
}
