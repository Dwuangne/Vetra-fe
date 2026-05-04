"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, isAuthenticated } from "@/lib/auth/auth-storage";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const nextPath = useMemo(() => pathname || "/", [pathname]);

  useEffect(() => {
    const session = getSession();
    const authed = isAuthenticated();
    if (!authed || !session) {
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }
    setChecking(false);
  }, [nextPath, router]);

  if (checking) {
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
