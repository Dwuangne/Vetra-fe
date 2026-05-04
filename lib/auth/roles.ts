/** Mirrors AspNet Roles seeded in backend (Identity). */
export const APP_ROLE = {
  Admin: "Admin",
  User: "User",
} as const;

/** True if user's roles grant admin access (used for FE routing only). */
export function isAdminRole(roles: readonly string[] | undefined): boolean {
  if (!roles?.length) return false;
  return roles.some((r) => r === APP_ROLE.Admin);
}

/**
 * After login / session restore:
 * — Admin lands on `/admin` unless `next` is a deeper path than `/`.
 * — Everyone else lands on `next` or `/`.
 */
export function getPostLoginRedirectPath(
  roles: readonly string[] | undefined,
  next: string | null
): string {
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") && !next.includes(":")
      ? next
      : null;

  if (isAdminRole(roles)) {
    if (safeNext && safeNext !== "/") return safeNext;
    return "/admin";
  }

  return safeNext || "/";
}
