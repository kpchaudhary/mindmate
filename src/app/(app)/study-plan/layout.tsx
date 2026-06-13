import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Plan — MindMate",
};

export default function StudyPlanRouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
