"use client";

import { useUser } from "@/components/app-shell";
import { DashboardHeader, InsightsDashboard } from "@/features/insights/insights-dashboard";

function InsightsContent() {
  const user = useUser();
  return (
    <>
      <DashboardHeader user={user} />
      <InsightsDashboard user={user} />
    </>
  );
}

export default function InsightsPage() {
  return <InsightsContent />;
}
