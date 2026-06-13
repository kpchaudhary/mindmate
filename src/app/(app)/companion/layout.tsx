import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companion — MindMate",
};

export default function CompanionRouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
