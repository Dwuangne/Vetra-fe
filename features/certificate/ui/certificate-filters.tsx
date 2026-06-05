"use client";

import { Button } from "@/components/ui/button";
import { EntitySelect } from "@/components/forms/entity-select";
import { Input } from "@/components/ui/input";
import { formatLocationOptionLabel } from "@/features/location/lib/format-location-label";
import { listLocations } from "@/lib/api/services/location.service";
import { listProducts } from "@/lib/api/services/product.service";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { BRAND_PRIMARY_BUTTON_CLASS } from "@/lib/ui/brand";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type CertificateFiltersProps = {
  keyword: string;
  onKeywordChange: (v: string) => void;
  productId: string;
  onProductIdChange: (v: string) => void;
  locationId: string;
  onLocationIdChange: (v: string) => void;
  tenantId?: string;
  onSearch: () => void;
  disabled?: boolean;
  locale: Locale;
  className?: string;
};

export function CertificateFilters({
  keyword,
  onKeywordChange,
  productId,
  onProductIdChange,
  locationId,
  onLocationIdChange,
  tenantId,
  onSearch,
  disabled,
  locale,
  className,
}: CertificateFiltersProps) {
  const keywordLabel = pickLocalized(messages.certificate.filters.keyword, locale);
  const productLabel = pickLocalized(messages.certificate.filters.productId, locale);
  const locationLabel = pickLocalized(messages.certificate.filters.locationId, locale);

  const loadProductOptions = useMemo(
    () => async (query: string) => {
      const res = await listProducts({
        keyword: query.trim() || undefined,
        page: 1,
        size: 50,
        tenantId,
      });
      return (res.data?.items ?? []).map((p) => ({ value: p.productId, label: `${p.name} (${p.gtin})` }));
    },
    [tenantId]
  );

  const loadLocationOptions = useMemo(
    () => async (query: string) => {
      const res = await listLocations({
        keyword: query.trim() || undefined,
        page: 1,
        size: 50,
        tenantId,
      });
      return (res.data?.items ?? []).map((l) => ({
        value: l.locationId,
        label: formatLocationOptionLabel(l.name, l.gln, l.extension),
      }));
    },
    [tenantId]
  );

  return (
    <div className={cn("flex w-full flex-wrap items-end gap-3", className)}>
      <div className="flex min-w-[180px] max-w-sm flex-1 flex-col gap-2">
        <label htmlFor="certificate-keyword" className="text-sm font-medium leading-none">
          {keywordLabel}
        </label>
        <Input
          id="certificate-keyword"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          disabled={disabled}
          placeholder={keywordLabel}
          autoComplete="off"
        />
      </div>
      <div className="flex min-w-[180px] max-w-sm flex-1 flex-col gap-2">
        <label className="text-sm font-medium leading-none">
          {productLabel}
        </label>
        <EntitySelect
          value={productId || null}
          onValueChange={(value) => onProductIdChange(value ?? "")}
          loadOptions={loadProductOptions}
          placeholder={`${productLabel} (all)`}
          disabled={disabled}
          emptyText="No products found"
        />
      </div>
      <div className="flex min-w-[180px] max-w-sm flex-1 flex-col gap-2">
        <label className="text-sm font-medium leading-none">
          {locationLabel}
        </label>
        <EntitySelect
          value={locationId || null}
          onValueChange={(value) => onLocationIdChange(value ?? "")}
          loadOptions={loadLocationOptions}
          placeholder={`${locationLabel} (all)`}
          disabled={disabled}
          emptyText="No locations found"
        />
      </div>
      <Button type="button" className={BRAND_PRIMARY_BUTTON_CLASS} onClick={onSearch} disabled={disabled}>
        Search
      </Button>
    </div>
  );
}
