"use client";

import { APP_ROLE } from "@/lib/auth/roles";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

export function tenantUserRoleLabel(role: string, locale: Locale): string {
  if (role === APP_ROLE.Supervisor) return pickLocalized(messages.tenantUser.roles.Supervisor, locale);
  if (role === APP_ROLE.Operator) return pickLocalized(messages.tenantUser.roles.Operator, locale);
  return role;
}
