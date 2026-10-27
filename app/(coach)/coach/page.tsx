import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export default async function CoachPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== Role.COACH && role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
    redirect("/dashboard");
  }

  redirect("/coach/dashboard");
}
