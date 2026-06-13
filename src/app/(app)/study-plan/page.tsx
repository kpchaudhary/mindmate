"use client";

import { useUser } from "@/components/app-shell";
import {
  StudyPlanDashboard,
  StudyPlanHeader,
} from "@/features/study-plan/study-plan-dashboard";

export default function StudyPlanPage() {
  const user = useUser();

  return (
    <>
      <StudyPlanHeader user={user} />
      <StudyPlanDashboard user={user} />
    </>
  );
}
