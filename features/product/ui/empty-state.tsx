"use client";

import { ListEmptyState } from "@/components/list/list-empty-state";
import type { ListEmptyVariant } from "@/components/list/list-empty-state";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";

type ProductEmptyStateProps = {
  variant: ListEmptyVariant;
  onClearFilters?: () => void;
};

export function ProductEmptyState({ variant, onClearFilters }: ProductEmptyStateProps) {
  const { locale } = useLocale();
  const noData = pickLocalized(messages.product.empty.noData, locale);
  const filtered = pickLocalized(messages.product.empty.noFilteredResults, locale);
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
