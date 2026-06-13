import { Loader2, Sparkles } from "lucide-react";

type LoadingScreenProps = {
  message?: string;
};

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-purple text-primary-foreground">
        <Sparkles className="h-6 w-6 motion-reduce:animate-none animate-pulse" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 motion-reduce:animate-none animate-spin" aria-hidden="true" />
        <span>{message}</span>
      </div>
    </div>
  );
}
