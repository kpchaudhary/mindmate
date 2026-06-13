"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useVoiceJournal } from "@/hooks/use-voice-journal";
import { InsightCard, type InsightData } from "@/features/journal/insight-card";
import { VoiceJournalButton } from "@/features/journal/voice-journal-button";
import { MOOD_OPTIONS } from "@/lib/mood";
import { getJournalPromptChips } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth/types";

type JournalFormProps = {
  user: SessionUser & { name: string; examType: string };
  onSubmitted?: () => void;
};

export function JournalForm({ user, onSubmitted }: JournalFormProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const insightRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");
  const [moodScore, setMoodScore] = useState(3);
  const [mockScore, setMockScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insight, setInsight] = useState<InsightData | null>(null);

  const promptChips = getJournalPromptChips(language);
  const selectedMood = MOOD_OPTIONS.find((m) => m.score === moodScore) ?? MOOD_OPTIONS[2];

  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    if (!isFinal || !text) return;
    setContent((prev) => {
      const trimmed = text.trim();
      if (!trimmed) return prev;
      const combined = prev ? `${prev.trimEnd()} ${trimmed}` : trimmed;
      return combined.slice(0, 5000);
    });
  }, []);

  const voice = useVoiceJournal({
    language: user.language ?? language,
    onTranscript: handleTranscript,
  });

  const voiceErrorMessage =
    voice.error === "permission"
      ? t("journal.voicePermission")
      : voice.error === "no-speech"
        ? t("journal.voiceNoSpeech")
        : voice.error === "failed" || voice.error === "unsupported"
          ? voice.error === "unsupported"
            ? t("journal.voiceUnsupported")
            : t("journal.voiceFailed")
          : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    voice.stop();
    setError(null);
    setLoading(true);
    setInsight(null);

    const parsedMock = mockScore.trim() ? Number(mockScore) : null;

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          moodScore,
          mockScore: parsedMock,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = (await response.json()) as {
        analysis: InsightData;
        streakCount?: number;
      };
      setInsight(data.analysis);
      setContent("");
      setMockScore("");
      const streakMsg =
        data.streakCount && data.streakCount > 1
          ? ` · ${data.streakCount} day streak!`
          : "";
      toast({
        title: "Analysis complete",
        description: `Your AI insight is ready.${streakMsg}`,
      });
      onSubmitted?.();
      setTimeout(() => insightRef.current?.focus(), 100);
    } catch {
      setError("Could not analyze your journal. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="corners corners-purple overflow-hidden">
        <div className="bg-gradient-purple px-6 py-4 text-primary-foreground">
          <h2 className="text-lg font-semibold">{t("journal.title")}</h2>
          <p className="mt-1 text-sm opacity-90">
            {t("journal.description").replace("today", `today, ${user.name}`)}
          </p>
        </div>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <Label>{t("journal.moodToday")}</Label>
              <div className="grid grid-cols-5 gap-2">
                {MOOD_OPTIONS.map((mood) => (
                  <button
                    key={mood.score}
                    type="button"
                    onClick={() => setMoodScore(mood.score)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-2 transition-all",
                      moodScore === mood.score
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border hover:bg-accent/50"
                    )}
                    aria-pressed={moodScore === mood.score}
                    aria-label={t(mood.labelKey)}
                  >
                    <span className="text-2xl" aria-hidden="true">{mood.emoji}</span>
                    <span className="text-[10px] text-muted-foreground hidden sm:block">
                      {t(mood.labelKey)}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-primary font-medium" aria-live="polite">
                {selectedMood.emoji} {t(selectedMood.labelKey)} ({moodScore}/5)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="journal">{t("journal.whatsOnMind")}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{content.length} / 5000</span>
                  <VoiceJournalButton
                    isSupported={voice.isSupported}
                    isListening={voice.isListening}
                    disabled={loading}
                    onToggle={voice.toggle}
                  />
                </div>
              </div>
              <Textarea
                id="journal"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t("journal.placeholder")}
                className="min-h-[160px] resize-none"
                required
                minLength={10}
                maxLength={5000}
              />
              {!content && (
                <div className="flex flex-wrap gap-2">
                  {promptChips.map((chip) => (
                    <Button
                      key={chip}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-1.5"
                      onClick={() => setContent(chip)}
                    >
                      {chip}
                    </Button>
                  ))}
                </div>
              )}
              {voice.isListening && (
                <p className="text-sm text-primary animate-pulse" aria-live="polite">
                  {t("journal.voiceListening")}
                  {voice.interimTranscript ? `: "${voice.interimTranscript}"` : ""}
                </p>
              )}
              {voiceErrorMessage && (
                <p className="text-sm text-destructive" role="alert">
                  {voiceErrorMessage}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mock-score">{t("journal.mockScore")}</Label>
              <Input
                id="mock-score"
                type="number"
                min={0}
                max={100}
                value={mockScore}
                onChange={(e) => setMockScore(e.target.value)}
                placeholder="e.g. 72"
                className="max-w-[140px]"
              />
              <p className="text-xs text-muted-foreground">{t("journal.mockScoreHint")}</p>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading || content.trim().length < 10}
              className="w-full bg-gradient-purple hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("journal.analyzing")}
                </>
              ) : (
                <>
                  <SendHorizonal className="h-4 w-4" />
                  {t("journal.analyze")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {insight && (
        <div ref={insightRef} tabIndex={-1}>
          <InsightCard insight={insight} />
        </div>
      )}
    </div>
  );
}
