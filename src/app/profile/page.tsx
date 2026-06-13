"use client";

import { AppShell, useUser } from "@/components/app-shell";
import { ProfileForm } from "@/features/profile/profile-form";

function ProfileContent() {
  const user = useUser();
  return <ProfileForm user={user} />;
}

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileContent />
    </AppShell>
  );
}
