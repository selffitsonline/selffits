import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStudentEnrollmentAction } from "@/actions/payments.actions";
import { StudentDashboardView } from "@/components/student/student-dashboard-view";

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ enrolled?: string; enrollment?: string }>;
}) {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const params = await searchParams;
  const isQueryEnrolled = params?.enrolled === "true" || params?.enrollment === "success";

  const res = await getStudentEnrollmentAction();
  const isEnrolled = isQueryEnrolled || (res && res.isEnrolled);

  return (
    <StudentDashboardView
      userName={session.user.name || "Student"}
      userEmail={session.user.email}
      initialIsEnrolled={!!isEnrolled}
      initialEnrollment={res?.enrollment || null}
    />
  );
}
