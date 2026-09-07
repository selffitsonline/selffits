export const dynamic = "force-dynamic";

import React from "react";
import { getAdminHomepageManagementAction } from "@/actions/admin.actions";
import { HomePageClient } from "@/components/public/home-page-client";

export default async function HomePage() {
  const res = await getAdminHomepageManagementAction();
  const homepageData = res && res.success ? res.homepageData : null;

  return <HomePageClient initialData={homepageData} />;
}
