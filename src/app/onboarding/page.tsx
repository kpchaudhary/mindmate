"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { LoadingScreen } from "@/components/loading-screen";
import { OnboardingForm } from "@/features/onboarding/onboarding-form";
import { isProfileComplete, type SessionUser } from "@/lib/auth/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const user = (await response.json()) as SessionUser;
        if (isProfileComplete(user)) {
          router.replace("/insights");
          return;
        }
      } catch {
        router.replace("/login");
        return;
      }

      setChecking(false);
    }

    void checkSession();
  }, [router]);

  if (checking) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-purple text-primary-foreground">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Set up your profile</h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            Tell us a bit about yourself so MindMate can personalize your wellness insights.
          </p>
        </div>
        <OnboardingForm onComplete={() => router.push("/insights")} />
      </div>
    </div>
  );
}
