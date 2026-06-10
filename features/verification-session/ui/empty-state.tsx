"use client";

import { ListEmptyState } from "@/components/list/list-empty-state";
import type { ListEmptyVariant } from "@/components/list/list-empty-state";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";

type VerificationSessionEmptyStateProps = {
  variant: ListEmptyVariant;
  onClearFilters?: () => void;
};

export function VerificationSessionEmptyState({
  variant,
  onClearFilters,
}: VerificationSessionEmptyStateProps) {
  const { locale } = useLocale();
  const noData = pickLocalized(messages.verificationSession.empty.noData, locale);
  const filtered = pickLocalized(messages.verificationSession.empty.filtered, locale);
  const desc =
    variant === "filtered-empty"
      ? pickLocalized(messages.common.noFilteredResultsDescription, locale)
      : pickLocalized(messages.common.noDataDescription, locale);

  return (
    <ListEmptyState
      variant={variant}
      onClearFilters={variant === "filtered-empty" ? onClearFilters : undefined}
      localizedTitle={variant === "filtered-empty" ? filtered : noData}
      localizedDescription={desc}
    />
  );
}
