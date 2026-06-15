"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { messages, pickLocalized, translateCommon } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { ALL_BIZ_STEPS, getBizStepLabel } from "@/lib/production/cbv-biz-steps";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { cn } from "@/lib/utils";

type FormTemplateFiltersProps = {
  keyword: string;
  onKeywordChange: (v: string) => void;
  bizStep: string;
  onBizStepChange: (v: string) => void;
  onSearch: () => void;
  disabled?: boolean;
  locale: Locale;
  className?: string;
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

export function FormTemplateFilters({
  keyword,
  onKeywordChange,
  bizStep,
  onBizStepChange,
  onSearch,
  disabled,
  locale,
  className,
}: FormTemplateFiltersProps) {
  const f = messages.formTemplate.filters;
  const keywordLabel = pickLocalized(f.keyword, locale);
  const bizStepLabel = pickLocalized(f.bizStep, locale);

  return (
    <div className={cn("flex w-full flex-wrap items-end gap-3", className)}>
      <div className="flex min-w-[180px] max-w-sm flex-1 flex-col gap-2">
        <label htmlFor="form-template-keyword" className="text-sm font-medium leading-none">
          {keywordLabel}
        </label>
        <Input
          id="form-template-keyword"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          disabled={disabled}
          placeholder={keywordLabel}
          autoComplete="off"
        />
      </div>
      <div className="flex min-w-[180px] max-w-sm flex-1 flex-col gap-2">
        <label htmlFor="form-template-biz-step" className="text-sm font-medium leading-none">
          {bizStepLabel}
        </label>
        <select
          id="form-template-biz-step"
          value={bizStep}
          onChange={(e) => onBizStepChange(e.target.value)}
          disabled={disabled}
          className={selectClass}
        >
          <option value="">{pickLocalized(f.allBizSteps, locale)}</option>
          {ALL_BIZ_STEPS.map((step) => (
            <option key={step} value={step}>
              {getBizStepLabel(step, locale)}
            </option>
          ))}
        </select>
      </div>
      <Button type="button" className={BRAND_PRIMARY_BUTTON_CLASS} onClick={onSearch} disabled={disabled}>
        {translateCommon("search", locale)}
      </Button>
    </div>
  );
}
