import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminBatchesAction, getBatchFormDataAction } from "@/actions/batch.actions";
import { AdminBatchesView } from "@/components/admin/admin-batches-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminBatchesPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/admin/login?callbackUrl=/admin/batches");
  }

  const [batchesRes, formDataRes] = await Promise.all([
    getAdminBatchesAction(),
    getBatchFormDataAction(),
  ]);

  const initialBatches = batchesRes?.batches || [];
  const formData = formDataRes?.data || {
    programs: [],
    plans: [],
    coaches: [],
    students: [],
    dayCombinations: ["Sunday & Wednesday", "Monday & Thursday", "Saturday & Tuesday"],
    timeSlots: ["Morning", "Evening", "Night"],
  };

  return (
    <AdminBatchesView
      initialBatches={initialBatches}
      programs={formData.programs}
      plans={formData.plans}
      coaches={formData.coaches}
      allStudents={formData.students}
      dayCombinations={formData.dayCombinations}
      timeSlots={formData.timeSlots}
    />
  );
}
