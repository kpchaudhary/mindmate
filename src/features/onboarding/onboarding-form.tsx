"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { t, type TranslationKey } from "@/lib/i18n/translations";
import { examTypes, type Language } from "@/lib/db/schema";
import type { SessionUser } from "@/lib/auth/types";

const EXAM_DESCRIPTIONS: Record<string, string> = {
  NEET: "MindMate tracks burnout from long study hours and helps you manage exam anxiety before medical entrance tests.",
  JEE: "MindMate spots confidence dips after mock tests and helps you stay steady through the JEE grind.",
  CUET: "MindMate helps you balance multiple subjects and the pressure of university entrance prep.",
  CAT: "MindMate supports you through aptitude prep stress and comparison with other aspirants.",
  GATE: "MindMate helps manage post-grad entrance pressure and sustained technical study burnout.",
  UPSC: "MindMate supports the marathon of UPSC prep — tracking emotional patterns over months of study.",
};

type OnboardingFormProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onComplete: (user: SessionUser) => void;
};

export function OnboardingForm({ language, onLanguageChange, onComplete }: OnboardingFormProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [examType, setExamType] = useState<string>("");
  const [examDate, setExamDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = (key: TranslationKey) => t(key, language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: Record<string, string> = { name, examType, language };
      if (examDate) {
        payload.examDate = new Date(examDate).toISOString();
      }

      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const user = (await response.json()) as SessionUser;
      toast({
        title: `${translate("onboarding.welcome")}, ${user.name}!`,
        description: translate("onboarding.toastDescription"),
      });
      onComplete(user);
    } catch {
      setError(translate("onboarding.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="corners corners-purple mx-auto w-full max-w-lg">
      <CardHeader>
        <div className="mb-2 flex items-center gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
        <CardTitle>
          {step === 1 ? translate("onboarding.welcome") : translate("onboarding.almostThere")}
        </CardTitle>
        <CardDescription>
          {step === 1
            ? translate("onboarding.step1Description")
            : translate("onboarding.step2Description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            if (step === 1) {
              e.preventDefault();
              if (name.trim()) setStep(2);
              return;
            }
            void handleSubmit(e);
          }}
          className="space-y-4"
        >
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">{translate("profile.name")}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={translate("onboarding.namePlaceholder")}
                  required
                  maxLength={80}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">{translate("settings.language")}</Label>
                <Select
                  value={language}
                  onValueChange={(value) => onLanguageChange(value as Language)}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिन्दी</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="exam">{translate("profile.exam")}</Label>
                <Select value={examType} onValueChange={setExamType} required>
                  <SelectTrigger id="exam">
                    <SelectValue placeholder={translate("onboarding.examPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {examTypes.map((exam) => (
                      <SelectItem key={exam} value={exam}>
                        {exam}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {examType && EXAM_DESCRIPTIONS[examType] && (
                <p className="rounded-lg bg-accent/50 p-3 text-sm text-muted-foreground">
                  {EXAM_DESCRIPTIONS[examType]}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="exam-date">
                  {translate("onboarding.examDate")}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({translate("onboarding.examDateOptional")})
                  </span>
                </Label>
                <Input
                  id="exam-date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />
                <p className="text-xs text-muted-foreground">
                  {translate("profile.examDateHint")}
                </p>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            {step === 2 && (
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" />
                {translate("onboarding.back")}
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 bg-gradient-purple"
              disabled={loading || (step === 1 ? !name.trim() : !examType)}
            >
              {loading
                ? translate("onboarding.settingUp")
                : step === 1
                  ? translate("onboarding.continue")
                  : translate("onboarding.start")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
