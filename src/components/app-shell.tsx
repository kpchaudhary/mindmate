"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { LoadingScreen } from "@/components/loading-screen";
import { PageTransition } from "@/components/page-transition";
import { getStoredUser, type StoredUser } from "@/lib/user-storage";

const UserContext = createContext<StoredUser | null>(null);

export function useUser() {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("useUser must be used within AppShell");
  }
  return user;
}

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.replace("/");
      return;
    }
    setUser(stored);
  }, [router]);

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <UserContext.Provider value={user}>
      <div className="min-h-screen bg-background">
        <AppNav user={user} onUserUpdate={setUser} />
        <main className="mx-auto max-w-6xl px-4 py-8 pb-24 md:pb-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </UserContext.Provider>
  );
}
