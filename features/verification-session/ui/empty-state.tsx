"use client";

import { Button } from "@/components/ui/button";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

type VerificationSessionEmptyStateProps = {
  variant: "filtered-empty" | "no-data";
  locale: Locale;
  onClearFilters?: () => void;
};

export function VerificationSessionEmptyState({
  variant,
  locale,
  onClearFilters,
}: VerificationSessionEmptyStateProps) {
  const m = messages.verificationSession.empty;
  const description =
    variant === "filtered-empty"
      ? pickLocalized(m.filtered, locale)
      : pickLocalized(m.noData, locale);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed px-6 py-12 text-center">
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {variant === "filtered-empty" && onClearFilters ? (
        <Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
          {pickLocalized(messages.verificationSession.actions.clearFilters, locale)}
        </Button>
      ) : null}
    </div>
  );
}
