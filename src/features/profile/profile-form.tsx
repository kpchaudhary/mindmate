"use client";

import { useState } from "react";
import { Pencil, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/user-avatar";
import { useUpdateUser } from "@/components/app-shell";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/language-context";
import { isProfileComplete, type SessionUser } from "@/lib/auth/types";
import { examTypes, type ExamType } from "@/lib/db/schema";
import { formatDate } from "@/lib/format-date";

type ProfileFormProps = {
  user: SessionUser & { name: string; examType: string };
};

type ViewMode = "read" | "edit";

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const onUserUpdate = useUpdateUser();

  const [mode, setMode] = useState<ViewMode>("read");
  const [name, setName] = useState(user.name);
  const [examType, setExamType] = useState<ExamType>(user.examType as ExamType);
  const [examDate, setExamDate] = useState(
    user.examDate ? user.examDate.slice(0, 10) : ""
  );
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  function startEditing() {
    setName(user.name);
    setExamType(user.examType as ExamType);
    setExamDate(user.examDate ? user.examDate.slice(0, 10) : "");
    setAvatarUrl(user.avatarUrl ?? "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMode("edit");
  }

  function cancelEditing() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMode("read");
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          examType,
          examDate: examDate ? new Date(examDate).toISOString() : null,
          avatarUrl: avatarUrl.trim() || null,
        }),
      });
      if (!response.ok) throw new Error("Failed");
      const updated = (await response.json()) as SessionUser;
      if (isProfileComplete(updated)) {
        onUserUpdate(updated);
      }
      toast({ title: t("profile.saved") });
      setMode("read");
    } catch {
      toast({ title: t("profile.saveError"), variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast({ title: t("profile.passwordMismatch"), variant: "destructive" });
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (response.status === 401) {
        toast({ title: t("profile.passwordWrong"), variant: "destructive" });
        return;
      }
      if (!response.ok) throw new Error("Failed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: t("profile.passwordChanged") });
    } catch {
      toast({ title: t("profile.passwordChangeError"), variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  }

  const previewAvatarUrl = avatarUrl.trim() || null;
  const displayAvatarUrl = mode === "edit" ? previewAvatarUrl : user.avatarUrl;

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="flex items-center gap-4">
        <UserAvatar
          name={mode === "edit" ? name || user.name : user.name}
          avatarUrl={displayAvatarUrl}
          className="h-16 w-16"
          fallbackClassName="text-base"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{t("profile.title")}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        {mode === "read" && (
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Pencil className="h-4 w-4" />
            {t("profile.edit")}
          </Button>
        )}
      </div>

      {mode === "read" ? (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4" />
            {t("profile.details")}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField label={t("profile.email")} value={user.email} />
            <ProfileField label={t("profile.name")} value={user.name} />
            <ProfileField label={t("profile.exam")} value={user.examType} />
            <ProfileField
              label={t("profile.examDate")}
              value={user.examDate ? formatDate(user.examDate, "long") : t("profile.notSet")}
            />
            <ProfileField
              label={t("profile.avatarUrl")}
              value={user.avatarUrl ? t("profile.customPhoto") : t("profile.usingInitials")}
            />
            <ProfileField label={t("profile.password")} value="••••••••" />
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              {t("profile.details")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-name">{t("profile.name")}</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-exam">{t("profile.exam")}</Label>
              <Select value={examType} onValueChange={(value) => setExamType(value as ExamType)}>
                <SelectTrigger id="profile-exam">
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

            <div className="space-y-2">
              <Label htmlFor="profile-exam-date">{t("profile.examDate")}</Label>
              <Input
                id="profile-exam-date"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t("profile.examDateHint")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-avatar">{t("profile.avatarUrl")}</Label>
              <Input
                id="profile-avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                maxLength={2048}
              />
              <p className="text-xs text-muted-foreground">{t("profile.avatarUrlHint")}</p>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-gradient-purple"
                onClick={() => void handleSaveProfile()}
                disabled={savingProfile || !name.trim() || !examType}
              >
                {savingProfile ? t("profile.saving") : t("profile.save")}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={cancelEditing}
                disabled={savingProfile}
              >
                {t("profile.cancel")}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4 rounded-lg border p-4">
            <div>
              <h2 className="font-medium">{t("profile.changePassword")}</h2>
              <p className="text-sm text-muted-foreground">{t("profile.changePasswordHint")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-current-password">{t("profile.currentPassword")}</Label>
              <Input
                id="profile-current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-new-password">{t("profile.newPassword")}</Label>
              <Input
                id="profile-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-confirm-password">{t("profile.confirmPassword")}</Label>
              <Input
                id="profile-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => void handleChangePassword()}
              disabled={
                changingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
            >
              {changingPassword ? t("profile.changingPassword") : t("profile.updatePassword")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
