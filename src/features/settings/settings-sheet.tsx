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
import { examTypes } from "@/lib/db/schema";
import { clearStoredUser, setStoredUser, type StoredUser } from "@/lib/user-storage";
import type { Theme } from "@/lib/theme-storage";

type SettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: StoredUser;
  onUserUpdate: (user: StoredUser) => void;
};

export function SettingsSheet({ open, onOpenChange, user, onUserUpdate }: SettingsSheetProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user.name);
  const [examType, setExamType] = useState(user.examType);
  const [saving, setSaving] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name, examType }),
      });
      if (!response.ok) throw new Error("Failed");
      const updated = (await response.json()) as StoredUser;
      setStoredUser(updated);
      onUserUpdate(updated);
      toast({ title: "Profile updated" });
      onOpenChange(false);
    } catch {
      toast({ title: "Could not save profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    clearStoredUser();
    setLogoutOpen(false);
    onOpenChange(false);
    router.replace("/");
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
              Settings
            </SheetTitle>
            <SheetDescription>Manage your profile and preferences.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="settings-name">Your name</Label>
                <Input
                  id="settings-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-exam">Exam</Label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger id="settings-exam">
                    <SelectValue />
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
              <Button
                className="w-full bg-gradient-purple"
                onClick={() => void handleSave()}
                disabled={saving || !name.trim() || !examType}
              >
                {saving ? "Saving..." : "Save changes"}
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
              You&apos;ll need to set up your profile again to continue using MindMate.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
