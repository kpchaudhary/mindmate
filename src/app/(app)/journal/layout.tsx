import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal — MindMate",
};

export default function JournalRouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
