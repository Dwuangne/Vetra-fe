"use client";

import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

type TenantUserEmptyStateProps = {
  locale: Locale;
};

export function TenantUserEmptyState({ locale }: TenantUserEmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
      {pickLocalized(messages.tenantUser.empty.noData, locale)}
    </div>
  );
}
