"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { cn } from "@/lib/utils";

type BatchFiltersProps = {
  keyword: string;
  onKeywordChange: (v: string) => void;
  onSearch: () => void;
  disabled?: boolean;
  locale: Locale;
  className?: string;
};

export function BatchFilters({
  keyword,
  onKeywordChange,
  onSearch,
  disabled,
  locale,
  className,
}: BatchFiltersProps) {
  const label = pickLocalized(messages.batch.filters.keyword, locale);

  return (
    <div className={cn("flex min-w-0 flex-wrap items-end gap-3", className)}>
      <div className="flex min-w-0 w-full max-w-md flex-1 flex-col gap-2">
        <label htmlFor="batch-keyword" className="text-sm font-medium leading-none">
          {label}
        </label>
        <Input
          id="batch-keyword"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          disabled={disabled}
          placeholder={label}
          autoComplete="off"
        />
      </div>
      <Button type="button" className={BRAND_PRIMARY_BUTTON_CLASS} onClick={onSearch} disabled={disabled}>
        Search
      </Button>
    </div>
  );
}
