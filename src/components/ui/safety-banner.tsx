"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SafetyBanner() {
  return (
    <Card className="border-destructive/40 bg-destructive/5" role="alert">
      <CardContent className="flex items-start gap-3 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-destructive">You seem to be going through a tough time</p>
          <p className="text-sm text-muted-foreground">
            MindMate is here for support, but please also reach out to a trusted teacher, counselor, or
            helpline. In India: iCall <strong>9152987821</strong> or Vandrevala Foundation{" "}
            <strong>1860-2662-345</strong>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
