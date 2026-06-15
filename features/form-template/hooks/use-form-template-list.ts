"use client";

import { listFormTemplates } from "@/lib/api/services/form-template.service";
import { useLocale } from "@/lib/i18n";
import { useKeywordPagedList } from "@/lib/table/use-keyword-paged-list";
import { useCallback, useState } from "react";

export function useFormTemplateList() {
  const { locale } = useLocale();
  const [bizStep, setBizStep] = useState("");

  const fetchFormTemplates = useCallback(
    (args: { keyword?: string; page: number; size: number }) =>
      listFormTemplates({
        ...args,
        bizStep: bizStep || undefined,
      }),
    [bizStep]
  );

  const list = useKeywordPagedList(fetchFormTemplates, locale);

  return {
    ...list,
    bizStep,
    setBizStep,
    hasBizStepFilter: bizStep.length > 0,
  };
}
