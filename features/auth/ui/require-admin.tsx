"use client";

import { APP_ROLE } from "@/lib/auth/roles";
import { RequireRole } from "./require-role";

/**
 * Requires an authenticated admin. Use inside {@link RequireAuth} on `/admin`.
 * Non-admins are sent home; unauthenticated flows should still wrap with RequireAuth first.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allow={[APP_ROLE.Admin]} loginNext="/admin">
      {children}
    </RequireRole>
  );
}
