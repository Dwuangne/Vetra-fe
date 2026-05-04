"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, isAuthenticated } from "@/lib/auth/auth-storage";
import { isAdminRole } from "@/lib/auth/roles";

/**
 * Requires an authenticated admin. Use inside {@link RequireAuth} on `/admin`.
 * Non-admins are sent home; unauthenticated flows should still wrap with RequireAuth first.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session || !isAuthenticated()) {
      router.replace("/login?next=/admin");
      return;
    }
    if (!isAdminRole(session.user.roles)) {
      router.replace("/");
      return;
    }
    setAllowed(true);
  }, [router]);

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
