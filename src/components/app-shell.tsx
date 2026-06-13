"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { LoadingScreen } from "@/components/loading-screen";
import { PageTransition } from "@/components/page-transition";
import { ReminderScheduler } from "@/components/reminder-scheduler";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { CompanionChatProvider } from "@/features/companion/companion-chat-context";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { isProfileComplete, type SessionUser } from "@/lib/auth/types";
import type { ExamType, Language } from "@/lib/db/schema";

type CompleteSessionUser = SessionUser & { name: string; examType: ExamType };

const UserContext = createContext<CompleteSessionUser | null>(null);
const UserUpdateContext = createContext<((user: SessionUser) => void) | null>(null);

export function useUser(): CompleteSessionUser {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("useUser must be used within AppShell");
  }
  return user;
}

export function useUpdateUser(): (user: SessionUser) => void {
  const update = useContext(UserUpdateContext);
  if (!update) {
    throw new Error("useUpdateUser must be used within AppShell");
  }
  return update;
}

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [user, setUser] = useState<CompleteSessionUser | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const session = (await response.json()) as SessionUser;
        if (!isProfileComplete(session)) {
          router.replace("/onboarding");
          return;
        }

        setUser(session);
      } catch {
        router.replace("/login");
      }
    }

    void loadSession();
  }, [router]);

  function handleUserUpdate(updated: SessionUser) {
    if (isProfileComplete(updated)) {
      setUser(updated);
    }
  }

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <UserContext.Provider value={user}>
      <UserUpdateContext.Provider value={handleUserUpdate}>
        <LanguageProvider language={user.language as Language}>
          <CompanionChatProvider user={user}>
            <ReminderScheduler user={user} />
            <ServiceWorkerRegister />
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
            >
              Skip to main content
            </a>
            <div className="min-h-screen bg-background">
              <AppNav user={user} onUserUpdate={handleUserUpdate} />
              <main id="main" className="mx-auto max-w-6xl px-4 py-8 pb-24 md:pb-8">
                <PageTransition>{children}</PageTransition>
              </main>
            </div>
          </CompanionChatProvider>
        </LanguageProvider>
      </UserUpdateContext.Provider>
    </UserContext.Provider>
  );
}
