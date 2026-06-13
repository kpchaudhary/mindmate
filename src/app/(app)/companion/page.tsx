"use client";

import { useUser } from "@/components/app-shell";
import { CompanionChat } from "@/features/companion/companion-chat";

export default function CompanionPage() {
  const user = useUser();
  return <CompanionChat user={user} />;
}
