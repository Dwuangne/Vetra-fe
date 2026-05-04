"use client";

import { ListEmptyState } from "@/components/list/list-empty-state";
import type { ListEmptyVariant } from "@/components/list/list-empty-state";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

type ProductionOrderEmptyStateProps = {
  variant: ListEmptyVariant;
  locale: Locale;
  onClearFilters?: () => void;
};

export function ProductionOrderEmptyState({ variant, locale, onClearFilters }: ProductionOrderEmptyStateProps) {
  const noData = pickLocalized(messages.productionOrder.empty.noData, locale);
  const filtered = pickLocalized(messages.productionOrder.empty.noFilteredResults, locale);
  const desc =
    variant === "filtered-empty"
      ? pickLocalized(messages.common.noFilteredResultsDescription, locale)
      : pickLocalized(messages.common.noDataDescription, locale);

  return (
    <ListEmptyState
      variant={variant}
      locale={locale}
      onClearFilters={variant === "filtered-empty" ? onClearFilters : undefined}
      localizedTitle={variant === "filtered-empty" ? filtered : noData}
      localizedDescription={desc}
    />
  );
}
