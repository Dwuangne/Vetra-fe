"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { cn } from "@/lib/utils";

type PartyFiltersProps = {
  keyword: string;
  onKeywordChange: (v: string) => void;
  onSearch: () => void;
  disabled?: boolean;
  locale: Locale;
  className?: string;
};

export function PartyFilters({ keyword, onKeywordChange, onSearch, disabled, locale, className }: PartyFiltersProps) {
  const label = pickLocalized(messages.party.filters.keyword, locale);

  return (
    <div className={cn("flex flex-wrap items-end gap-3", className)}>
      <div className="flex min-w-[200px] max-w-md flex-1 flex-col gap-2">
        <label htmlFor="party-keyword" className="text-sm font-medium leading-none">
          {label}
        </label>
        <Input
          id="party-keyword"
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
