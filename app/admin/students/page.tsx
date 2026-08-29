import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminStudentsAction, getAdminStudentCategoriesAction } from "@/actions/admin.actions";
import { AdminStudentsView } from "@/components/admin/admin-students-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminStudentsPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/admin/login?callbackUrl=/admin/students");
  }

  const [studentsRes, categoriesRes] = await Promise.all([
    getAdminStudentsAction(),
    getAdminStudentCategoriesAction(),
  ]);

  const initialStudents = studentsRes?.students || [];
  const initialCategories = categoriesRes?.categories || [];
  const initialPrograms = categoriesRes?.programs || [];

  return (
    <AdminStudentsView
      initialStudents={initialStudents}
      initialCategories={initialCategories}
      initialPrograms={initialPrograms}
    />
  );
}
