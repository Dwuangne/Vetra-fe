"use client";

import { useAuth } from "@/features/auth";
import { listCertificates } from "@/lib/api/services/certificate.service";
import { useLocale } from "@/lib/i18n";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";
import { useCallback, useState } from "react";

export function useCertificateList() {
  const { locale } = useLocale();
  const { user } = useAuth();
  const tenantId = user?.tenantId?.trim() || undefined;
  const [productId, setProductId] = useState("");
  const [locationId, setLocationId] = useState("");

  const fetchCertificates = useCallback(
    (args: { keyword?: string; page: number; size: number }) =>
      listCertificates({
        ...args,
        tenantId,
        productId: productId.trim() || undefined,
        locationId: locationId.trim() || undefined,
      }),
    [tenantId, productId, locationId]
  );

  const list = useKeywordPagedList(fetchCertificates, locale);

  return {
    ...list,
    productId,
    setProductId,
    locationId,
    setLocationId,
    hasProductFilter: productId.trim().length > 0,
    hasLocationFilter: locationId.trim().length > 0,
  };
}
