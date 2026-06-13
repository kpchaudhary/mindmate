import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile — MindMate",
};

export default function ProfileRouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
