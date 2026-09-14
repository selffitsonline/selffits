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
    getAdminStudentsAction({ page: 1, pageSize: 10, tab: "ALL" }),
    getAdminStudentCategoriesAction(),
  ]);

  const initialStudents = studentsRes?.students || [];
  const initialPagination = studentsRes?.pagination || { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 1 };
  const initialCounts = studentsRes?.counts || { ALL: 0, ACTIVE: 0, UNENROLLED: 0, EXPIRED: 0, BLOCKED: 0 };
  const initialCategories = categoriesRes?.categories || [];
  const initialPrograms = categoriesRes?.programs || [];

  return (
    <AdminStudentsView
      initialStudents={initialStudents}
      initialPagination={initialPagination}
      initialCounts={initialCounts}
      initialCategories={initialCategories}
      initialPrograms={initialPrograms}
    />
  );
}

