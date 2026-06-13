const SAFE_REDIRECT_PATTERN = /^\/[a-zA-Z0-9/_-]*$/;

const BLOCKED_PREFIXES = ["/login", "/register"];

export function isSafeRedirect(path: string | null | undefined): path is string {
  if (!path) return false;
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return false;
  }
  if (!SAFE_REDIRECT_PATTERN.test(path)) return false;
  return !BLOCKED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function resolveRedirectPath(
  redirect: string | null | undefined,
  fallback: string
): string {
  return isSafeRedirect(redirect) ? redirect : fallback;
}
