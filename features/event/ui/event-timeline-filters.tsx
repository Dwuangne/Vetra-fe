"use client";

import { useEffect, useMemo, useState } from "react";

import { EntitySelect } from "@/components/forms/entity-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listBatches } from "@/lib/api/services/batch.service";
import {
  getProductionOrderById,
  listProductionOrders,
} from "@/lib/api/services/production-order.service";
import { messages, pickLocalized, translateCommon } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { cn } from "@/lib/utils";

type EventTimelineFiltersProps = {
  lotKeyword: string;
  productionOrderId: string;
  locationId: string;
  epcUri: string;
  batchId: string;
  onLotKeywordChange: (value: string) => void;
  onProductionOrderIdChange: (value: string) => void;
  onLocationIdChange: (value: string) => void;
  onEpcUriChange: (value: string) => void;
  onBatchIdChange: (value: string) => void;
  onSearch: () => void;
  disabled?: boolean;
  locale: Locale;
  className?: string;
};

export function EventTimelineFilters({
  lotKeyword,
  productionOrderId,
  locationId: _locationId,
  epcUri: _epcUri,
  batchId,
  onLotKeywordChange,
  onProductionOrderIdChange,
  onLocationIdChange: _onLocationIdChange,
  onEpcUriChange: _onEpcUriChange,
  onBatchIdChange,
  onSearch,
  disabled,
  locale,
  className,
}: EventTimelineFiltersProps) {
  const f = messages.event.filters;
  const [selectedProductionOrderLabel, setSelectedProductionOrderLabel] = useState<
    string | undefined
  >();

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
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex w-full flex-wrap items-end gap-3">
        <div className="flex min-w-[200px] max-w-md flex-1 flex-col gap-2">
          <label htmlFor="event-lot-keyword" className="text-sm font-medium leading-none">
            {pickLocalized(f.lot, locale)}
          </label>
          <Input
            id="event-lot-keyword"
            value={lotKeyword}
            onChange={(e) => onLotKeywordChange(e.target.value)}
            disabled={disabled}
            placeholder={pickLocalized(f.lotPlaceholder, locale)}
            autoComplete="off"
          />
        </div>
        <div className="flex min-w-[200px] max-w-xs flex-1 flex-col gap-2">
          <label className="text-sm font-medium leading-none">
            {pickLocalized(f.productionOrder, locale)}
          </label>
          <EntitySelect
            value={productionOrderId || null}
            onValueChange={(id) => onProductionOrderIdChange(id ?? "")}
            loadOptions={loadProductionOrderOptions}
            selectedLabel={selectedProductionOrderLabel}
            placeholder={pickLocalized(f.allProductionOrders, locale)}
            disabled={disabled}
          />
        </div>
        <div className="flex min-w-[200px] max-w-xs flex-1 flex-col gap-2">
          <label className="text-sm font-medium leading-none">{pickLocalized(f.batch, locale)}</label>
          <EntitySelect
            value={batchId || null}
            onValueChange={(id) => onBatchIdChange(id ?? "")}
            loadOptions={loadBatchOptions}
            placeholder={pickLocalized(f.allBatches, locale)}
            disabled={disabled}
          />
        </div>
        <Button
          type="button"
          className={BRAND_PRIMARY_BUTTON_CLASS}
          onClick={onSearch}
          disabled={disabled}
        >
          {translateCommon("search", locale)}
        </Button>
      </div>
    </div>
  );
}
