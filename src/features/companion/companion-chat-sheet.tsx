"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CompanionChatPanel } from "@/features/companion/companion-chat";
import { useLanguage } from "@/lib/i18n/language-context";
import type { SessionUser } from "@/lib/auth/types";

type CompanionChatSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: SessionUser & { name: string; examType: string };
};

export function CompanionChatSheet({ open, onOpenChange, user }: CompanionChatSheetProps) {
  const { t } = useLanguage();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="center"
        className="flex flex-col gap-0 overflow-hidden shadow-2xl"
      >
        <SheetTitle className="sr-only">{t("companion.title")}</SheetTitle>
        <CompanionChatPanel user={user} />
      </SheetContent>
    </Sheet>
  );
}
