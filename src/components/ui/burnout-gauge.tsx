"use client";

import { cn } from "@/lib/utils";

const BURNOUT_COLORS = {
  low: "bg-success",
  medium: "bg-warning",
  high: "bg-destructive",
} as const;

const BURNOUT_WIDTH = {
  low: "w-1/3",
  medium: "w-2/3",
  high: "w-full",
} as const;

type BurnoutGaugeProps = {
  level: "low" | "medium" | "high";
  reasoning: string;
  className?: string;
};

const BURNOUT_VALUES = {
  low: 1,
  medium: 2,
  high: 3,
} as const;

export function BurnoutGauge({ level, reasoning, className }: BurnoutGaugeProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Burnout Risk</span>
        <span className="text-sm capitalize text-muted-foreground">{level}</span>
      </div>
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-secondary"
        role="meter"
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={BURNOUT_VALUES[level]}
        aria-label={`Burnout risk: ${level}`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            BURNOUT_COLORS[level],
            BURNOUT_WIDTH[level]
          )}
        />
      </div>
      <p className="text-sm text-muted-foreground">{reasoning}</p>
    </div>
  );
}
