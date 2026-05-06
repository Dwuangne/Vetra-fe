"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, isAuthenticated } from "@/lib/auth/auth-storage";
import type { AppRole } from "@/lib/auth/roles";

type RequireRoleProps = {
  allow: readonly AppRole[];
  children: React.ReactNode;
  loginNext?: string;
  fallbackPath?: string;
};

/**
 * Requires an authenticated user with at least one allowed role.
 * Wrap with `RequireAuth` for protected routes.
 */
export function RequireRole({
  allow,
  children,
  loginNext,
  fallbackPath = "/",
}: RequireRoleProps) {
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session || !isAuthenticated()) {
      const next = loginNext ?? fallbackPath;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    const roles = session.user.roles ?? [];
    const hasAllowedRole = roles.some((role) => allow.includes(role as AppRole));
    if (!hasAllowedRole) {
      router.replace(fallbackPath);
      return;
    }

    setAllowed(true);
  }, [allow, fallbackPath, loginNext, router]);

  if (!allowed) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-48 rounded-md bg-muted/60" />
          <div className="h-24 w-full rounded-md bg-muted/40" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
