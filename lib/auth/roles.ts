/** Mirrors AspNet Roles seeded in backend (Identity). */
export const APP_ROLE = {
  Admin: "Admin",
  Manager: "Manager",
  Supervisor: "Supervisor",
  Operator: "Operator",
} as const;

export type AppRole = (typeof APP_ROLE)[keyof typeof APP_ROLE];

const TENANT_ROLE_SET = new Set<AppRole>([
  APP_ROLE.Manager,
  APP_ROLE.Supervisor,
  APP_ROLE.Operator,
]);

/** True if user's roles grant admin access (used for FE routing only). */
export function isAdminRole(roles: readonly string[] | undefined): boolean {
  if (!roles?.length) return false;
  return roles.some((r) => r === APP_ROLE.Admin);
}

/** True when user has any tenant-scoped role. */
export function hasTenantRole(roles: readonly string[] | undefined): boolean {
  if (!roles?.length) return false;
  return roles.some((role) => TENANT_ROLE_SET.has(role as AppRole));
}

/** Forms/config management is restricted to tenant Manager only. */
export function canManageConfig(roles: readonly string[] | undefined): boolean {
  if (!roles?.length) return false;
  return roles.some((role) => role === APP_ROLE.Manager);
}

/** Production transitions require Manager or Supervisor. */
export function canApproveProduction(roles: readonly string[] | undefined): boolean {
  if (!roles?.length) return false;
  return roles.some((role) => role === APP_ROLE.Manager || role === APP_ROLE.Supervisor);
}

/** Shop-floor execution is available to any tenant role. */
export function canExecuteShopFloor(roles: readonly string[] | undefined): boolean {
  return hasTenantRole(roles);
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
