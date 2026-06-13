"use client";

import { AppShell, useUser } from "@/components/app-shell";
import { CompanionChat } from "@/features/companion/companion-chat";

function CompanionContent() {
  const user = useUser();
  return <CompanionChat user={user} />;
}

export default function CompanionPage() {
  return (
    <AppShell>
      <CompanionContent />
    </AppShell>
  );
}
