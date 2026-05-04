"use client";

import { useMemo } from "react";

import { EntitySelect } from "@/components/forms/entity-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listBatches } from "@/lib/api/services/batch.service";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { cn } from "@/lib/utils";

type ProductInstanceFiltersProps = {
  keyword?: string;
  onKeywordChange?: (v: string) => void;
  onSearch?: () => void;
  disabled?: boolean;
  locale: Locale;
  className?: string;
  /** Pick a batch (no URL `batchId` yet); keyword row is hidden. */
  variant?: "pick-batch" | "filter-instances";
  onBatchSelected?: (batchId: string) => void;
};

export function ProductInstanceFilters({
  keyword = "",
  onKeywordChange,
  onSearch,
  disabled,
  locale,
  className,
  variant = "filter-instances",
  onBatchSelected,
}: ProductInstanceFiltersProps) {
  const kwLabel = pickLocalized(messages.productInstance.filters.keyword, locale);
  const batchLabel = pickLocalized(messages.productInstance.filters.batchId, locale);
  const searchLabel = pickLocalized(messages.productInstance.actions.search, locale);

  const loadBatchOptions = useMemo(
    () => async (query: string) => {
      const res = await listBatches({ keyword: query || undefined, page: 1, size: 50 });
      return (res.data?.items ?? []).map((b) => ({
        value: b.batchId,
        label: b.lotNumber,
      }));
    },
    []
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {variant === "pick-batch" ? (
        <div className="flex min-w-[200px] max-w-md flex-col gap-2">
          <label className="text-sm font-medium leading-none">{batchLabel}</label>
          <EntitySelect
            value={null}
            onValueChange={(id) => {
              if (id) onBatchSelected?.(id);
            }}
            loadOptions={loadBatchOptions}
            placeholder={batchLabel}
            disabled={disabled}
          />
        </div>
      ) : null}

      {variant === "filter-instances" ? (
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex min-w-[200px] max-w-md flex-1 flex-col gap-2">
            <label htmlFor="product-instance-keyword" className="text-sm font-medium leading-none">
              {kwLabel}
            </label>
            <Input
              id="product-instance-keyword"
              value={keyword}
              onChange={(e) => onKeywordChange?.(e.target.value)}
              disabled={disabled}
              placeholder={kwLabel}
              autoComplete="off"
            />
          </div>
          <Button type="button" className={BRAND_PRIMARY_BUTTON_CLASS} onClick={() => onSearch?.()} disabled={disabled}>
            {searchLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
