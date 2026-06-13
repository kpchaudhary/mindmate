"use client";

import { useState } from "react";
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
import { examTypes } from "@/lib/db/schema";
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
  onComplete: (user: SessionUser) => void;
};

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [examType, setExamType] = useState<string>("");
  const [examDate, setExamDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: Record<string, string> = { name, examType };
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
        title: `Welcome, ${user.name}!`,
        description: "Your dashboard is ready.",
      });
      onComplete(user);
    } catch {
      setError("Something went wrong. Please try again.");
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
          {step === 1 ? "Welcome to MindMate" : "Almost there"}
        </CardTitle>
        <CardDescription>
          {step === 1
            ? "Tell us your name to personalize your wellness journey."
            : "Select your exam so MindMate can tailor insights to your prep."}
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
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav"
                required
                maxLength={80}
                autoFocus
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="exam">Exam you&apos;re preparing for</Label>
                <Select value={examType} onValueChange={setExamType} required>
                  <SelectTrigger id="exam">
                    <SelectValue placeholder="Select exam" />
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
                <p className="text-sm text-muted-foreground rounded-lg bg-accent/50 p-3">
                  {EXAM_DESCRIPTIONS[examType]}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="exam-date">When is your exam? (optional)</Label>
                <Input
                  id="exam-date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />
                <p className="text-xs text-muted-foreground">
                  Enables exam countdown on your dashboard
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 bg-gradient-purple"
              disabled={
                loading ||
                (step === 1 ? !name.trim() : !examType)
              }
            >
              {loading
                ? "Setting up..."
                : step === 1
                  ? "Continue"
                  : "Start my wellness journey"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
