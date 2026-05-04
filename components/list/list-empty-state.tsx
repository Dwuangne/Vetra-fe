"use client";

import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { defaultLocale } from "@/lib/i18n";
import { translateCommon } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

export type ListEmptyVariant = "no-data" | "filtered-empty";

type ListEmptyStateProps = {
  variant: ListEmptyVariant;
  locale?: Locale;
  className?: string;
  /** Shown for `filtered-empty` when provided */
  onClearFilters?: () => void;
  /** When set, overrides default `common` catalog title/description for this empty state */
  localizedTitle?: string;
  localizedDescription?: string;
};

/**
 * Empty list: either no records yet, or filters returned nothing (list UX).
 */
export function ListEmptyState({
  variant,
  locale = defaultLocale,
  className,
  onClearFilters,
  localizedTitle,
  localizedDescription,
}: ListEmptyStateProps) {
  const titleKey =
    variant === "filtered-empty" ? "noFilteredResultsTitle" : "noDataTitle";
  const descKey =
    variant === "filtered-empty"
      ? "noFilteredResultsDescription"
      : "noDataDescription";

  const title =
    localizedTitle ??
    translateCommon(titleKey, locale);
  const description =
    localizedDescription ?? translateCommon(descKey, locale);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-12 text-center",
        className
      )}
      role="status"
    >
      <Inbox className="mb-3 h-10 w-10 text-muted-foreground" aria-hidden />
      <p className="text-base font-medium">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {variant === "filtered-empty" && onClearFilters && (
        <Button variant="outline" className="mt-6" type="button" onClick={onClearFilters}>
          {translateCommon("clearFilters", locale)}
        </Button>
      )}
    </div>
  );
}
