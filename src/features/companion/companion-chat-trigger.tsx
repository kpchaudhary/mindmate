"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

type CompanionChatTriggerProps = {
  onClick: () => void;
};

export function CompanionChatTrigger({ onClick }: CompanionChatTriggerProps) {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();

  return (
    <Button
      size="icon"
      className={cn(
        "fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg",
        "bg-gradient-purple text-primary-foreground hover:opacity-90",
        "md:bottom-6 md:right-6"
      )}
      onClick={onClick}
      aria-label={t("companion.openSheet")}
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-primary-foreground/25"
        animate={
          reducedMotion
            ? undefined
            : { scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        }
        aria-hidden="true"
      />
      <motion.span
        animate={reducedMotion ? undefined : { scale: [1, 1.1, 1] }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </motion.span>
    </Button>
  );
}
