"use client";

import { listAttributeDefinitions } from "@/lib/api/services/attribute-definition.service";
import type { AttributeDataType } from "@/lib/api/types/attribute-definition";
import { useLocale } from "@/lib/i18n";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";
import { useCallback, useState } from "react";

export function useAttributeDefinitionList() {
  const { locale } = useLocale();
  const [dataType, setDataType] = useState<"" | AttributeDataType>("");

  const fetchAttributeDefinitions = useCallback(
    (args: { keyword?: string; page: number; size: number }) =>
      listAttributeDefinitions({
        ...args,
        dataType: dataType || undefined,
      }),
    [dataType]
  );

  const list = useKeywordPagedList(fetchAttributeDefinitions, locale);

  return {
    ...list,
    dataType,
    setDataType,
    hasDataTypeFilter: dataType.length > 0,
  };
}
