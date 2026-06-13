"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

type CompanionChatTriggerProps = {
  onClick: () => void;
};

export function CompanionChatTrigger({ onClick }: CompanionChatTriggerProps) {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative rounded-full"
      onClick={onClick}
      aria-label={t("companion.openSheet")}
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-primary/20"
        animate={
          reducedMotion
            ? undefined
            : { scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        }
        aria-hidden="true"
      />
      <motion.span
        animate={reducedMotion ? undefined : { scale: [1, 1.08, 1] }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
      </motion.span>
    </Button>
  );
}
