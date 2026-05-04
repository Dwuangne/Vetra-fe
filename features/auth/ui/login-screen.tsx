"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, isAuthenticated } from "@/lib/auth/auth-storage";
import { getPostLoginRedirectPath } from "@/lib/auth/roles";
import { LoginFormPanel } from "./login-form-panel";
import { LoginMarketingPanel } from "./login-marketing-panel";

/** Auth feature entry: split layout + login form (API via `@/lib/api`). */
export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAuthenticated()) return;
    const session = getSession();
    if (!session) return;
    const next = searchParams.get("next");
    router.replace(getPostLoginRedirectPath(session.user.roles, next));
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen font-sans">
      <LoginMarketingPanel />
      <LoginFormPanel />
    </div>
  );
}
