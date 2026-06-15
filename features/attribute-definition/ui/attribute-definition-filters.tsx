"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AttributeDataType } from "@/lib/api/types/attribute-definition";
import { messages, pickLocalized, translateCommon } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { ATTRIBUTE_DATA_TYPES, getAttributeDataTypeLabel } from "@/lib/production/attribute-data-types";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { NATIVE_SELECT_CLASS } from "@/lib/ui/form-control-classes";
import { cn } from "@/lib/utils";

type AttributeDefinitionFiltersProps = {
  keyword: string;
  onKeywordChange: (v: string) => void;
  dataType: "" | AttributeDataType;
  onDataTypeChange: (v: "" | AttributeDataType) => void;
  onSearch: () => void;
  disabled?: boolean;
  locale: Locale;
  className?: string;
};

const selectClass = NATIVE_SELECT_CLASS;

export function AttributeDefinitionFilters({
  keyword,
  onKeywordChange,
  dataType,
  onDataTypeChange,
  onSearch,
  disabled,
  locale,
  className,
}: AttributeDefinitionFiltersProps) {
  const f = messages.attributeDefinition.filters;
  const keywordLabel = pickLocalized(f.keyword, locale);
  const dataTypeLabel = pickLocalized(f.dataType, locale);

  return (
    <div className={cn("flex w-full flex-wrap items-end gap-3", className)}>
      <div className="flex min-w-[180px] max-w-sm flex-1 flex-col gap-2">
        <label htmlFor="attribute-definition-keyword" className="text-sm font-medium leading-none">
          {keywordLabel}
        </label>
        <Input
          id="attribute-definition-keyword"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          disabled={disabled}
          placeholder={keywordLabel}
          autoComplete="off"
        />
      </div>
      <div className="flex min-w-[180px] max-w-sm flex-1 flex-col gap-2">
        <label htmlFor="attribute-definition-data-type" className="text-sm font-medium leading-none">
          {dataTypeLabel}
        </label>
        <select
          id="attribute-definition-data-type"
          value={dataType}
          onChange={(e) => onDataTypeChange((e.target.value || "") as "" | AttributeDataType)}
          disabled={disabled}
          className={selectClass}
        >
          <option value="">{pickLocalized(f.allDataTypes, locale)}</option>
          {ATTRIBUTE_DATA_TYPES.map((type) => (
            <option key={type} value={type}>
              {getAttributeDataTypeLabel(type, locale)}
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
