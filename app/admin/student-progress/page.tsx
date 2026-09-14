import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminStudentProgressListAction } from "@/actions/student-progress.actions";
import { AdminStudentProgressView } from "@/components/admin/admin-student-progress-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminStudentProgressPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/admin/login?callbackUrl=/admin/student-progress");
  }

  const res = await getAdminStudentProgressListAction();
  const initialBatches = res?.batches || [];
  const initialStudents = res?.students || [];

  return (
    <AdminStudentProgressView
      initialBatches={initialBatches}
      initialStudents={initialStudents}
    />
  );
}
