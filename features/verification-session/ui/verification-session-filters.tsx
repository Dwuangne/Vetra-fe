"use client";

import { useMemo } from "react";

import { EntitySelect } from "@/components/forms/entity-select";
import { Button } from "@/components/ui/button";
import { listBatches } from "@/lib/api/services/batch.service";
import { listProducts } from "@/lib/api/services/product.service";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";

type VerificationSessionFiltersProps = {
  batchId: string;
  productId: string;
  onBatchIdChange: (value: string) => void;
  onProductIdChange: (value: string) => void;
  onSearch: () => void;
  disabled?: boolean;
  locale: Locale;
};

export function VerificationSessionFilters({
  batchId,
  productId,
  onBatchIdChange,
  onProductIdChange,
  onSearch,
  disabled,
  locale,
}: VerificationSessionFiltersProps) {
  const f = messages.verificationSession.filters;
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

  const loadProductOptions = useMemo(
    () => async (query: string) => {
      const res = await listProducts({ keyword: query || undefined, page: 1, size: 50 });
      return (res.data?.items ?? []).map((p) => ({
        value: p.productId,
        label: p.name || p.gtin || p.productId,
      }));
    },
    []
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex min-w-[200px] max-w-xs flex-col gap-2">
        <label className="text-sm font-medium leading-none">{pickLocalized(f.batch, locale)}</label>
        <EntitySelect
          value={batchId || null}
          onValueChange={(id) => onBatchIdChange(id ?? "")}
          loadOptions={loadBatchOptions}
          placeholder={pickLocalized(f.allBatches, locale)}
          disabled={disabled}
        />
      </div>
      <div className="flex min-w-[200px] max-w-xs flex-col gap-2">
        <label className="text-sm font-medium leading-none">{pickLocalized(f.product, locale)}</label>
        <EntitySelect
          value={productId || null}
          onValueChange={(id) => onProductIdChange(id ?? "")}
          loadOptions={loadProductOptions}
          placeholder={pickLocalized(f.allProducts, locale)}
          disabled={disabled}
        />
      </div>
      <Button type="button" className={BRAND_PRIMARY_BUTTON_CLASS} onClick={onSearch} disabled={disabled}>
        {searchLabel}
      </Button>
    </div>
  );
}
