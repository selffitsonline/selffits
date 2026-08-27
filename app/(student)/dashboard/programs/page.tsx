import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStudentEnrollmentAction } from "@/actions/payments.actions";
import { StudentProgramsView } from "@/components/student/student-programs-view";

export default async function StudentProgramsPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/dashboard/programs");
  }

  const res = await getStudentEnrollmentAction();
  const initialCourses = res?.enrollments || [];

  return <StudentProgramsView initialCourses={initialCourses} />;
}
