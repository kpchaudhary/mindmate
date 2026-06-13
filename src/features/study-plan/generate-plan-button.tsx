"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/language-context";

type GeneratePlanButtonProps = {
  loading: boolean;
  hasPlan: boolean;
  error?: boolean;
  onGenerate: () => void;
};

export function GeneratePlanButton({ loading, hasPlan, error, onGenerate }: GeneratePlanButtonProps) {
  const { t } = useLanguage();

  if (!hasPlan) {
    return (
      <Card className="corners corners-purple">
        <CardHeader>
          <CardTitle>{t("studyPlan.emptyTitle")}</CardTitle>
          <CardDescription>{t("studyPlan.emptyDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="bg-gradient-purple" onClick={onGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("studyPlan.generating")}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t("studyPlan.generate")}
              </>
            )}
          </Button>
          {error && (
            <p className="text-sm text-destructive">{t("studyPlan.generateError")}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={onGenerate} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("studyPlan.regenerating")}
        </>
      ) : (
        t("studyPlan.regenerate")
      )}
    </Button>
  );
}
