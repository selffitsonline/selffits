import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCoachDashboardDataAction } from "@/actions/coach.actions";
import { CoachDashboardView } from "@/components/coach/coach-dashboard-view";

export const metadata = {
  title: "Coach Dashboard — SELFFITS Academy",
  description: "Live upcoming class management and meeting hub for SELFFITS coaches.",
};

export default async function CoachDashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/coach/dashboard");
  }

  const role = session.user.role;
  if (role !== "COACH" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const res = await getCoachDashboardDataAction();

  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen bg-[#0A0B0E] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#14161D] border border-white/10 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-extrabold text-white font-[family-name:var(--font-outfit)]">
            Coach Account Required
          </h2>
          <p className="text-xs text-gray-400">
            {res.error || "No active Coach profile is linked to your email address."}
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
          >
            Back to Student Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <CoachDashboardView initialData={res.data} />;
}
