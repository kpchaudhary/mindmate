"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Brain, Heart, Lightbulb, Sparkles, Target } from "lucide-react";
import { BurnoutGauge } from "@/components/ui/burnout-gauge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { SafetyBanner } from "@/components/ui/safety-banner";

export type InsightData = {
  mood: string;
  emotionalPatterns: string[];
  stressTriggers: string[];
  copingStrategy: string;
  motivation: string;
  wellnessRecommendation: string;
  burnoutLevel: "low" | "medium" | "high";
  burnoutReasoning: string;
  riskFlag: boolean;
};

type InsightCardProps = {
  insight: InsightData;
};

export function InsightCard({ insight }: InsightCardProps) {
  const reducedMotion = useReducedMotion();

  const content = (
    <div className="space-y-4">
      {insight.riskFlag && <SafetyBanner />}

      <Card className="corners corners-purple overflow-hidden border-primary/20">
        <div className="bg-gradient-purple px-6 py-4 text-primary-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            <CardTitle className="text-lg text-primary-foreground">Today&apos;s AI Insight</CardTitle>
          </div>
          <p className="mt-1 text-sm opacity-90">Mood: {insight.mood}</p>
        </div>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <InsightSection
            icon={Heart}
            title="Emotional Patterns"
            items={insight.emotionalPatterns}
          />
          <InsightSection icon={Target} title="Stress Triggers" items={insight.stressTriggers} />
          <InsightBlock icon={Lightbulb} title="Coping Strategy" text={insight.copingStrategy} />
          <InsightBlock icon={Sparkles} title="Motivation" text={insight.motivation} />
          <InsightBlock
            icon={Brain}
            title="Wellness Recommendation"
            text={insight.wellnessRecommendation}
            className="md:col-span-2"
          />
          <div className="md:col-span-2">
            <BurnoutGauge level={insight.burnoutLevel} reasoning={insight.burnoutReasoning} />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (reducedMotion) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {content}
    </motion.div>
  );
}

function InsightSection({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
}) {
  return (
    <div className="space-y-2 rounded-lg border bg-accent/30 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        {title}
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-sm text-muted-foreground">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InsightBlock({
  icon: Icon,
  title,
  text,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 rounded-lg border bg-accent/30 p-4 ${className ?? ""}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        {title}
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
