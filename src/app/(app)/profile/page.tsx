"use client";

import { useUser } from "@/components/app-shell";
import { ProfileForm } from "@/features/profile/profile-form";

export default function ProfilePage() {
  const user = useUser();
  return <ProfileForm user={user} />;
}
