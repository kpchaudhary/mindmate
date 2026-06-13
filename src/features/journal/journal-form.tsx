"use client";

import { useRef, useState } from "react";
import { Loader2, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { InsightCard, type InsightData } from "@/features/journal/insight-card";
import type { StoredUser } from "@/lib/user-storage";

const MOOD_LABELS = ["Very low", "Low", "Okay", "Good", "Great"];

type JournalFormProps = {
  user: StoredUser;
  onSubmitted?: () => void;
};

export function JournalForm({ user, onSubmitted }: JournalFormProps) {
  const { toast } = useToast();
  const insightRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");
  const [moodScore, setMoodScore] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insight, setInsight] = useState<InsightData | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setInsight(null);

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          content,
          moodScore,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = (await response.json()) as { analysis: InsightData };
      setInsight(data.analysis);
      setContent("");
      toast({ title: "Analysis complete", description: "Your AI insight is ready." });
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
      <Card className="corners">
        <CardHeader>
          <CardTitle>Daily Check-in</CardTitle>
          <CardDescription>
            Share how you&apos;re feeling today, {user.name}. MindMate will uncover patterns
            standard trackers miss.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="mood-slider">Mood today</Label>
                <span className="text-sm font-medium text-primary" aria-live="polite">
                  {MOOD_LABELS[moodScore - 1]} ({moodScore}/5)
                </span>
              </div>
              <Slider
                id="mood-slider"
                value={[moodScore]}
                onValueChange={([value]) => setMoodScore(value)}
                min={1}
                max={5}
                step={1}
                aria-valuetext={MOOD_LABELS[moodScore - 1]}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="journal">What&apos;s on your mind?</Label>
                <span className="text-xs text-muted-foreground">{content.length} / 5000</span>
              </div>
              <Textarea
                id="journal"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="I studied for 8 hours but still feel behind. Mock test scores dropped and my parents asked about ranks..."
                className="min-h-[160px]"
                required
                minLength={10}
                maxLength={5000}
              />
            </div>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <Button type="submit" disabled={loading || content.trim().length < 10} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <SendHorizonal className="h-4 w-4" />
                  Analyze my journal
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
