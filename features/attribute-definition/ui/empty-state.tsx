"use client";

import { ListEmptyState } from "@/components/list/list-empty-state";
import type { ListEmptyVariant } from "@/components/list/list-empty-state";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";

type AttributeDefinitionEmptyStateProps = {
  variant: ListEmptyVariant;
  onClearFilters?: () => void;
};

export function AttributeDefinitionEmptyState({ variant, onClearFilters }: AttributeDefinitionEmptyStateProps) {
  const { locale } = useLocale();
  const noData = pickLocalized(messages.attributeDefinition.empty.noData, locale);
  const filtered = pickLocalized(messages.attributeDefinition.empty.noFilteredResults, locale);
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
