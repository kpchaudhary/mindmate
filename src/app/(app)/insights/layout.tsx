import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights — MindMate",
};

export default function InsightsRouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
