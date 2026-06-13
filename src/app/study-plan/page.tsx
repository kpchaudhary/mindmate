"use client";

import { AppShell, useUser } from "@/components/app-shell";
import {
  StudyPlanDashboard,
  StudyPlanHeader,
} from "@/features/study-plan/study-plan-dashboard";

function StudyPlanContent() {
  const user = useUser();

  return (
    <>
      <StudyPlanHeader user={user} />
      <StudyPlanDashboard user={user} />
    </>
  );
}

export default function StudyPlanPage() {
  return (
    <AppShell>
      <StudyPlanContent />
    </AppShell>
  );
}
