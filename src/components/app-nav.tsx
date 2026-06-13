"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/user-avatar";
import { SettingsSheet } from "@/features/settings/settings-sheet";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import type { SessionUser } from "@/lib/auth/types";

const NAV_HREFS = [
  { href: "/insights", key: "nav.dashboard" as const, icon: LayoutDashboard },
  { href: "/journal", key: "nav.journal" as const, icon: BookOpen },
  { href: "/study-plan", key: "nav.studyPlan" as const, icon: CalendarCheck },
  { href: "/companion", key: "nav.companion" as const, icon: MessageCircle },
];

type AppNavProps = {
  user: SessionUser & { name: string; examType: string };
  onUserUpdate: (user: SessionUser & { name: string; examType: string }) => void;
};

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  showLabel = true,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  showLabel?: boolean;
}) {
  const link = (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "line-bg font-medium text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {showLabel && <span>{label}</span>}
    </Link>
  );

  if (showLabel) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function AppNav({ user, onUserUpdate }: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t } = useLanguage();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  const navItems = NAV_HREFS.map((item) => ({ ...item, label: t(item.key) }));

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/insights" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-purple text-primary-foreground">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">MindMate</p>
              <p className="text-xs text-muted-foreground">
                {user.name} · {user.examType}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {navItems.map(({ href, label, icon }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                icon={icon}
                active={pathname === href}
              />
            ))}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="h-4 w-4" />
                  {t("nav.profile")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
                {t("settings.title")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void handleLogout()}>
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden pb-[env(safe-area-inset-bottom)]"
        aria-label="Mobile"
      >
        <div className="mx-auto flex max-w-6xl items-stretch justify-around">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors",
                  active ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={user}
        onUserUpdate={onUserUpdate}
      />
    </>
  );
}

export function MobileNavSpacer() {
  return <div className="h-16 md:hidden" aria-hidden="true" />;
}
