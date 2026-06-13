"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CompanionChatSheet } from "@/features/companion/companion-chat-sheet";
import { CompanionChatTrigger } from "@/features/companion/companion-chat-trigger";
import type { SessionUser } from "@/lib/auth/types";

type CompanionChatUser = SessionUser & { name: string; examType: string };

type CompanionChatContextValue = {
  openChat: () => void;
  closeChat: () => void;
  isOpen: boolean;
};

const CompanionChatContext = createContext<CompanionChatContextValue | null>(null);

export function useCompanionChat(): CompanionChatContextValue {
  const ctx = useContext(CompanionChatContext);
  if (!ctx) {
    throw new Error("useCompanionChat must be used within CompanionChatProvider");
  }
  return ctx;
}

type CompanionChatProviderProps = {
  user: CompanionChatUser;
  children: React.ReactNode;
};

export function CompanionChatProvider({ user, children }: CompanionChatProviderProps) {
  const [open, setOpen] = useState(false);

  const openChat = useCallback(() => setOpen(true), []);
  const closeChat = useCallback(() => setOpen(false), []);

  return (
    <CompanionChatContext.Provider value={{ openChat, closeChat, isOpen: open }}>
      {children}
      {!open && <CompanionChatTrigger onClick={openChat} />}
      <CompanionChatSheet open={open} onOpenChange={setOpen} user={user} />
    </CompanionChatContext.Provider>
  );
}
