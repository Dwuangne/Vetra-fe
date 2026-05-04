"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, isAuthenticated } from "@/lib/auth/auth-storage";
import { isAdminRole } from "@/lib/auth/roles";

/** When an admin opens `/`, send them to the admin area instead of dashboard. */
export function RedirectIfAdminFromHome() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session || !isAuthenticated()) return;
    if (!isAdminRole(session.user.roles)) return;
    router.replace("/admin");
  }, [router]);

  return null;
}
