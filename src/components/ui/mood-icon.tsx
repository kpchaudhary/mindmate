import { useId } from "react";
import { cn } from "@/lib/utils";

const BRAND_LIGHT = "#9264BA";
const BRAND_DARK = "#783EA9";

type MoodScore = 1 | 2 | 3 | 4 | 5;

type MoodIconProps = {
  score: number;
  className?: string;
};

function clampScore(score: number): MoodScore {
  const rounded = Math.round(score);
  if (rounded <= 1) return 1;
  if (rounded >= 5) return 5;
  return rounded as MoodScore;
}

function MoodFace({ score }: { score: MoodScore }) {
  switch (score) {
    case 1:
      return (
        <>
          <path
            d="M8.5 10.5c0-1 .8-1.5 1.5-1.5s1.5.5 1.5 1.5"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
          <path
            d="M12.5 10.5c0-1 .8-1.5 1.5-1.5s1.5.5 1.5 1.5"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
          <path
            d="M8.5 16.5c1.5 2 5.5 2 7 0"
            stroke={BRAND_DARK}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="9.5" cy="13" r="0.75" fill="white" opacity="0.7" />
        </>
      );
    case 2:
      return (
        <>
          <circle cx="9" cy="10.5" r="1.25" fill="white" opacity="0.95" />
          <circle cx="15" cy="10.5" r="1.25" fill="white" opacity="0.95" />
          <path
            d="M9 15.5c1.2 1 4.8 1 6 0"
            stroke={BRAND_DARK}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      );
    case 3:
      return (
        <>
          <circle cx="9" cy="10.5" r="1.25" fill="white" opacity="0.95" />
          <circle cx="15" cy="10.5" r="1.25" fill="white" opacity="0.95" />
          <path
            d="M9.5 15.5h5"
            stroke={BRAND_DARK}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      );
    case 4:
      return (
        <>
          <circle cx="9" cy="10.5" r="1.25" fill="white" opacity="0.95" />
          <circle cx="15" cy="10.5" r="1.25" fill="white" opacity="0.95" />
          <path
            d="M9 14.5c1.2 1.5 4.8 1.5 6 0"
            stroke={BRAND_DARK}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      );
    case 5:
      return (
        <>
          <path
            d="M7.5 10.5c.8-.8 1.7-.8 2.5 0"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            fill="none"
            opacity="0.95"
          />
          <path
            d="M14 10.5c.8-.8 1.7-.8 2.5 0"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
            fill="none"
            opacity="0.95"
          />
          <path
            d="M8 14c1.5 2.5 6.5 2.5 8 0"
            stroke={BRAND_DARK}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="6" cy="8" r="1" fill={BRAND_LIGHT} opacity="0.8" />
          <circle cx="18" cy="8" r="1" fill={BRAND_LIGHT} opacity="0.8" />
        </>
      );
  }
}

export function MoodIcon({ score, className }: MoodIconProps) {
  const gradientId = useId();
  const moodScore = clampScore(score);

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor={BRAND_LIGHT} />
          <stop offset="1" stopColor={BRAND_DARK} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill={`url(#${gradientId})`} />
      <circle cx="12" cy="12" r="9.25" stroke={BRAND_DARK} strokeWidth="0.5" opacity="0.35" />
      <MoodFace score={moodScore} />
    </svg>
  );
}
