"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { EntitySelect } from "@/components/forms/entity-select";
import { Input } from "@/components/ui/input";
import {
  getProductionOrderById,
  listProductionOrders,
} from "@/lib/api/services/production-order.service";
import { messages, pickLocalized, translateCommon } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { cn } from "@/lib/utils";

type BatchFiltersProps = {
  keyword: string;
  onKeywordChange: (v: string) => void;
  productionOrderId: string;
  onProductionOrderIdChange: (v: string) => void;
  onSearch: () => void;
  disabled?: boolean;
  locale: Locale;
  className?: string;
};

export function BatchFilters({
  keyword,
  onKeywordChange,
  productionOrderId,
  onProductionOrderIdChange,
  onSearch,
  disabled,
  locale,
  className,
}: BatchFiltersProps) {
  const f = messages.batch.filters;
  const keywordLabel = pickLocalized(f.keyword, locale);
  const productionOrderFieldLabel = pickLocalized(f.productionOrderId, locale);
  const [selectedProductionOrderLabel, setSelectedProductionOrderLabel] = useState<string | undefined>();

  useEffect(() => {
    const id = productionOrderId.trim();
    if (!id) {
      setSelectedProductionOrderLabel(undefined);
      return;
    }

    let cancelled = false;
    void getProductionOrderById(id)
      .then((res) => {
        if (!cancelled) setSelectedProductionOrderLabel(res.data?.orderNumber);
      })
      .catch(() => {
        if (!cancelled) setSelectedProductionOrderLabel(undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [productionOrderId]);

  const loadProductionOrderOptions = useMemo(
    () => async (query: string) => {
      const res = await listProductionOrders({
        keyword: query.trim() || undefined,
        page: 1,
        size: 50,
      });
      return (res.data?.items ?? []).map((item) => ({
        value: item.productionOrderId,
        label: item.orderNumber,
      }));
    },
    []
  );

  return (
    <div className={cn("flex w-full flex-wrap items-end gap-3", className)}>
      <div className="flex min-w-[180px] max-w-md flex-1 flex-col gap-2">
        <label htmlFor="batch-keyword" className="text-sm font-medium leading-none">
          {keywordLabel}
        </label>
        <Input
          id="batch-keyword"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          disabled={disabled}
          placeholder={keywordLabel}
          autoComplete="off"
        />
      </div>
      <div className="flex min-w-[180px] max-w-sm flex-1 flex-col gap-2">
        <label className="text-sm font-medium leading-none">{productionOrderFieldLabel}</label>
        <EntitySelect
          value={productionOrderId || null}
          onValueChange={(value) => onProductionOrderIdChange(value ?? "")}
          loadOptions={loadProductionOrderOptions}
          selectedLabel={selectedProductionOrderLabel}
          placeholder={pickLocalized(f.allProductionOrders, locale)}
          disabled={disabled}
          emptyText={pickLocalized(f.noProductionOrdersFound, locale)}
        />
      </div>
      <Button type="button" className={BRAND_PRIMARY_BUTTON_CLASS} onClick={onSearch} disabled={disabled}>
        {translateCommon("search", locale)}
      </Button>
    </div>
  );
}
