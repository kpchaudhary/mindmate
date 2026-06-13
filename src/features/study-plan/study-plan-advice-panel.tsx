"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownLite } from "@/lib/markdown-lite";
import { useLanguage } from "@/lib/i18n/language-context";

const ADVICE_CHIPS = [
  "I feel burned out today",
  "Can I skip some tasks?",
  "I only have 2 hours today",
];

type AdviceResult = {
  advice: string;
  suggestedChanges: string[];
};

export function StudyPlanAdvicePanel() {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdviceResult | null>(null);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setError(false);

    try {
      const response = await fetch("/api/study-plan/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!response.ok) throw new Error("Failed");

      setResult(await response.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("studyPlan.adviceTitle")}</CardTitle>
        <CardDescription>{t("studyPlan.adviceDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {ADVICE_CHIPS.map((chip) => (
            <Button
              key={chip}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setInput(chip)}
            >
              {chip}
            </Button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("studyPlan.advicePlaceholder")}
            rows={2}
            className="min-h-0 resize-none"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {error && (
          <p className="text-sm text-destructive">{t("studyPlan.adviceError")}</p>
        )}

        {result && (
          <div className="space-y-3 rounded-lg bg-accent/50 p-3">
            <div className="text-sm">
              <MarkdownLite content={result.advice} />
            </div>
            <ul className="space-y-1 text-sm">
              {result.suggestedChanges.map((change) => (
                <li key={change} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
