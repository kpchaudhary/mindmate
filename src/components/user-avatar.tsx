"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarSrc } from "@/lib/avatar-src";
import { getUserInitials } from "@/lib/user-initials";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
};

export function UserAvatar({
  name,
  avatarUrl,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const src = getAvatarSrc(avatarUrl);

  return (
    <Avatar className={cn("h-8 w-8", className)}>
      {src ? (
        <AvatarImage
          src={src}
          alt={name}
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      ) : null}
      <AvatarFallback
        className={cn("bg-primary/10 text-primary text-xs", fallbackClassName)}
      >
        {getUserInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
