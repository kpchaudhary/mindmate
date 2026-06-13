export function getAvatarSrc(avatarUrl: string | null | undefined): string | null {
  const trimmed = avatarUrl?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed;
  return `/api/avatar?url=${encodeURIComponent(trimmed)}`;
}
