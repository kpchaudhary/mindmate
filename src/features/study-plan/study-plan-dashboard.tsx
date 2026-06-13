"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { GeneratePlanButton } from "@/features/study-plan/generate-plan-button";
import {
  StudyPlanItemList,
  type StudyPlanItem,
} from "@/features/study-plan/study-plan-item-list";
import { StudyPlanAdvicePanel } from "@/features/study-plan/study-plan-advice-panel";
import { useLanguage } from "@/lib/i18n/language-context";
import type { SessionUser } from "@/lib/auth/types";

type StudyPlanData = {
  plan: {
    id: string;
    title: string;
    weekStart: string;
    aiRationale: string;
  } | null;
  items: StudyPlanItem[];
  progress: { total: number; done: number; percent: number };
};

type StudyPlanDashboardProps = {
  user: SessionUser & { name: string; examType: string };
};

export function StudyPlanDashboard({ user }: StudyPlanDashboardProps) {
  const { t } = useLanguage();
  const [data, setData] = useState<StudyPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/study-plan");
      if (!response.ok) throw new Error("Failed");
      setData(await response.json());
    } catch {
      setError(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleGenerate() {
    if (data?.plan && !window.confirm(t("studyPlan.regenerateConfirm"))) return;

    setGenerating(true);
    try {
      const response = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error("Failed");
      setData(await response.json());
    } catch {
      setError(true);
    } finally {
      setGenerating(false);
    }
  }

  function handleItemUpdate(item: StudyPlanItem) {
    setData((prev) => {
      if (!prev) return prev;
      const items = prev.items.map((i) => (i.id === item.id ? item : i));
      const done = items.filter((i) => i.status === "done").length;
      return {
        ...prev,
        items,
        progress: {
          total: items.length,
          done,
          percent: items.length > 0 ? Math.round((done / items.length) * 100) : 0,
        },
      };
    });
  }

  function handleItemDelete(id: string) {
    setData((prev) => {
      if (!prev) return prev;
      const items = prev.items.filter((i) => i.id !== id);
      const done = items.filter((i) => i.status === "done").length;
      return {
        ...prev,
        items,
        progress: {
          total: items.length,
          done,
          percent: items.length > 0 ? Math.round((done / items.length) * 100) : 0,
        },
      };
    });
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <ErrorState
        message={t("studyPlan.loadError")}
        onRetry={() => void load()}
      />
    );
  }

  if (!data?.plan) {
    return (
      <GeneratePlanButton
        loading={generating}
        hasPlan={false}
        onGenerate={() => void handleGenerate()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{data.plan.title}</h2>
          <p className="text-sm text-muted-foreground">
            {user.examType} · {t("studyPlan.weekOf")}{" "}
            {new Date(data.plan.weekStart).toLocaleDateString()}
          </p>
        </div>
        <GeneratePlanButton
          loading={generating}
          hasPlan
          onGenerate={() => void handleGenerate()}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("studyPlan.progress")}</CardTitle>
          <CardDescription>
            {data.progress.done}/{data.progress.total} {t("studyPlan.tasksDone")} ·{" "}
            {data.progress.percent}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-purple transition-all"
              style={{ width: `${data.progress.percent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="corners corners-purple border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">{t("studyPlan.aiRationale")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{data.plan.aiRationale}</p>
        </CardContent>
      </Card>

      <StudyPlanItemList
        items={data.items}
        onUpdate={handleItemUpdate}
        onDelete={handleItemDelete}
      />

      <StudyPlanAdvicePanel />
    </div>
  );
}

export function StudyPlanHeader({
  user,
}: {
  user: SessionUser & { name: string; examType: string };
}) {
  const { t } = useLanguage();

  return (
    <div className="mb-6 space-y-1">
      <div className="flex items-center gap-2">
        <CalendarCheck className="h-6 w-6 text-primary" aria-hidden="true" />
        <h1 className="text-2xl font-bold">{t("studyPlan.title")}</h1>
      </div>
      <p className="text-muted-foreground">
        {user.examType} · {t("studyPlan.subtitle")}
      </p>
    </div>
  );
}
