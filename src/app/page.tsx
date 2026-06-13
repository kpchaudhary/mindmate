"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Brain, BarChart3, MessageCircle } from "lucide-react";
import { LoadingScreen } from "@/components/loading-screen";
import { OnboardingForm } from "@/features/onboarding/onboarding-form";
import { getStoredUser, type StoredUser } from "@/lib/user-storage";

const BENEFITS = [
  { icon: Brain, text: "Uncover hidden stress triggers from your journal entries" },
  { icon: BarChart3, text: "Track mood trends and burnout before they spiral" },
  { icon: MessageCircle, text: "Get 24/7 companion support tailored to your exam prep" },
];

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      router.replace("/insights");
      return;
    }
    setChecking(false);
  }, [router]);

  function handleComplete(_user: StoredUser) {
    router.push("/insights");
  }

  if (checking) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-purple text-primary-foreground">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">MindMate</h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            Your AI wellness companion for high-stakes exam prep. Uncover hidden stress triggers,
            track emotional patterns, and get personalized support.
          </p>
          <ul className="mt-6 space-y-3 text-left max-w-md mx-auto">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </motion.div>
        <OnboardingForm onComplete={handleComplete} />
      </div>
    </div>
  );
}
