"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/language-context";

type GeneratePlanButtonProps = {
  loading: boolean;
  hasPlan: boolean;
  onGenerate: () => void;
};

export function GeneratePlanButton({ loading, hasPlan, onGenerate }: GeneratePlanButtonProps) {
  const { t } = useLanguage();

  if (!hasPlan) {
    return (
      <Card className="corners corners-purple">
        <CardHeader>
          <CardTitle>{t("studyPlan.emptyTitle")}</CardTitle>
          <CardDescription>{t("studyPlan.emptyDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
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
