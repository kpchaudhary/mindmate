"use client";

import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

type VoiceJournalButtonProps = {
  isSupported: boolean;
  isListening: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

export function VoiceJournalButton({
  isSupported,
  isListening,
  disabled,
  onToggle,
}: VoiceJournalButtonProps) {
  const { t } = useLanguage();

  if (!isSupported) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              className="gap-1.5"
              aria-label={t("journal.voiceUnsupported")}
            >
              <MicOff className="h-4 w-4" />
              {t("journal.voice")}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{t("journal.voiceUnsupported")}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      type="button"
      variant={isListening ? "default" : "outline"}
      size="sm"
      disabled={disabled}
      onClick={onToggle}
      className={cn("gap-1.5", isListening && "bg-destructive hover:bg-destructive/90")}
      aria-pressed={isListening}
      aria-label={isListening ? t("journal.voiceStop") : t("journal.voiceStart")}
    >
      {isListening ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-foreground opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-foreground" />
          </span>
          <MicOff className="h-4 w-4" />
          {t("journal.voiceStop")}
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          {t("journal.voice")}
        </>
      )}
    </Button>
  );
}
