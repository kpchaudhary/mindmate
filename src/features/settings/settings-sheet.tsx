"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Moon, Settings, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/language-context";
import { isProfileComplete, type SessionUser } from "@/lib/auth/types";
import type { Language } from "@/lib/db/schema";
import type { Theme } from "@/lib/theme-storage";

type SettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: SessionUser & { name: string; examType: string };
  onUserUpdate: (user: SessionUser & { name: string; examType: string }) => void;
};

export function SettingsSheet({ open, onOpenChange, user, onUserUpdate }: SettingsSheetProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [reminderEnabled, setReminderEnabled] = useState(user.reminderEnabled);
  const [reminderTime, setReminderTime] = useState(user.reminderTime ?? "20:00");
  const [language, setLanguage] = useState<Language>(user.language);
  const [saving, setSaving] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      if (reminderEnabled && typeof Notification !== "undefined" && Notification.permission === "default") {
        await Notification.requestPermission();
      }

      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderEnabled,
          reminderTime: reminderEnabled ? reminderTime : null,
          language,
        }),
      });
      if (!response.ok) throw new Error("Failed");
      const updated = (await response.json()) as SessionUser;
      if (isProfileComplete(updated)) {
        onUserUpdate(updated);
      }
      toast({ title: "Preferences updated" });
      onOpenChange(false);
      if (updated.language !== user.language) {
        window.location.reload();
      }
    } catch {
      toast({ title: "Could not save preferences", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setLogoutOpen(false);
    onOpenChange(false);
    router.replace("/login");
  }

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
    { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
    { value: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("settings.title")}
            </SheetTitle>
            <SheetDescription>Manage your preferences.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="settings-language">{t("settings.language")}</Label>
                <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                  <SelectTrigger id="settings-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi / Hinglish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="settings-reminder">{t("settings.reminder")}</Label>
                  <Button
                    id="settings-reminder"
                    type="button"
                    variant={reminderEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReminderEnabled(!reminderEnabled)}
                  >
                    {reminderEnabled ? "On" : "Off"}
                  </Button>
                </div>
                {reminderEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="settings-reminder-time">{t("settings.reminderTime")}</Label>
                    <Input
                      id="settings-reminder-time"
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <Button
                className="w-full bg-gradient-purple"
                onClick={() => void handleSave()}
                disabled={saving}
              >
                {saving ? "Saving..." : t("settings.save")}
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map(({ value, label, icon }) => (
                  <Button
                    key={value}
                    variant={theme === value ? "default" : "outline"}
                    size="sm"
                    className="flex flex-col gap-1 h-auto py-2"
                    onClick={() => setTheme(value)}
                  >
                    {icon}
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={() => setLogoutOpen(true)}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              You&apos;ll need to sign in again to continue using MindMate.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleLogout()}>
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
