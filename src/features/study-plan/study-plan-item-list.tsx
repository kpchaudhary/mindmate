"use client";

import { useMemo, useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateLabel } from "@/lib/format-date";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export type StudyPlanItem = {
  id: string;
  subject: string;
  topic: string;
  description: string;
  durationMinutes: number;
  scheduledDate: string;
  status: "pending" | "done";
  sortOrder: number;
  isUserEdited: boolean;
};

type StudyPlanItemListProps = {
  items: StudyPlanItem[];
  onUpdate: (item: StudyPlanItem) => void;
  onDelete: (id: string) => void;
};

export function StudyPlanItemList({ items, onUpdate, onDelete }: StudyPlanItemListProps) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState<StudyPlanItem | null>(null);
  const [saving, setSaving] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, StudyPlanItem[]>();
    for (const item of items) {
      const key = item.scheduledDate.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  async function toggleDone(item: StudyPlanItem) {
    const nextStatus = item.status === "done" ? "pending" : "done";
    const response = await fetch("/api/study-plan/items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, status: nextStatus }),
    });

    if (response.ok) {
      const data = (await response.json()) as { item: StudyPlanItem };
      onUpdate(data.item);
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    setSaving(true);
    try {
      const response = await fetch("/api/study-plan/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          subject: editing.subject,
          topic: editing.topic,
          description: editing.description,
          durationMinutes: editing.durationMinutes,
          scheduledDate: editing.scheduledDate,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { item: StudyPlanItem };
        onUpdate(data.item);
        setEditing(null);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const response = await fetch("/api/study-plan/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) onDelete(id);
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("studyPlan.noTasks")}</p>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {grouped.map(([date, dayItems]) => (
          <Card key={date}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{formatDateLabel(date)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dayItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3",
                    item.status === "done" && "opacity-60"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => void toggleDone(item)}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                      item.status === "done"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    )}
                    aria-label={item.status === "done" ? "Mark pending" : "Mark done"}
                  >
                    {item.status === "done" && <Check className="h-3 w-3" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={cn(
                          "font-medium",
                          item.status === "done" && "line-through"
                        )}
                      >
                        {item.subject} · {item.topic}
                      </p>
                      <Badge variant="outline">{item.durationMinutes} min</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditing(item)}
                      aria-label="Edit task"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => void handleDelete(item.id)}
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("studyPlan.editTask")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={saveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">{t("studyPlan.subject")}</Label>
                <Input
                  id="subject"
                  value={editing.subject}
                  onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">{t("studyPlan.topic")}</Label>
                <Input
                  id="topic"
                  value={editing.topic}
                  onChange={(e) => setEditing({ ...editing, topic: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("studyPlan.description")}</Label>
                <Textarea
                  id="description"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">{t("studyPlan.duration")}</Label>
                <Input
                  id="duration"
                  type="number"
                  min={15}
                  max={480}
                  value={editing.durationMinutes}
                  onChange={(e) =>
                    setEditing({ ...editing, durationMinutes: Number(e.target.value) })
                  }
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {t("studyPlan.saveTask")}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
