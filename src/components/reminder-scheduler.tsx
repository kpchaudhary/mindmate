"use client";

import { useEffect, useRef } from "react";
import type { SessionUser } from "@/lib/auth/types";

type ReminderSchedulerProps = {
  user: SessionUser;
};

export function ReminderScheduler({ user }: ReminderSchedulerProps) {
  const notifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user.reminderEnabled || !user.reminderTime) return;
    if (typeof Notification === "undefined") return;

    async function checkReminder() {
      const now = new Date();
      const [hours, minutes] = user.reminderTime!.split(":").map(Number);
      const todayKey = now.toISOString().slice(0, 10);

      if (now.getHours() !== hours || now.getMinutes() !== minutes) return;
      if (notifiedRef.current === todayKey) return;

      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }

      if (Notification.permission !== "granted") return;

      const title =
        user.language === "hi"
          ? "MindMate — आज का जर्नल लिखें"
          : "MindMate — Time for your daily check-in";
      const body =
        user.language === "hi"
          ? "2 मिनट में अपना मूड और तनाव लॉग करें।"
          : "Take 2 minutes to log your mood and stress today.";

      new Notification(title, { body, icon: "/icons/icon-192.png" });
      notifiedRef.current = todayKey;
    }

    const interval = setInterval(() => void checkReminder(), 30_000);
    void checkReminder();

    return () => clearInterval(interval);
  }, [user.reminderEnabled, user.reminderTime, user.language]);

  return null;
}
