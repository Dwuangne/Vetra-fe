"use client";

import { toast } from "@/hooks/use-toast";
import { ApiHttpError } from "@/lib/api/errors";
import { defaultLocale } from "@/lib/i18n";
import { resolveApiErrorMessage } from "@/lib/i18n/resolve-api-error";
import { translateCommon } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/types";

/** Non-validation API failure surfaced as a destructive toast using `resolveApiErrorMessage`. */
export function toastApiError(error: unknown, locale: Locale = defaultLocale): void {
  if (error instanceof ApiHttpError) {
    toast({
      variant: "destructive",
      title: translateCommon("errorGeneric", locale),
      description: resolveApiErrorMessage(error, locale),
    });
    return;
  }

  toast({
    variant: "destructive",
    title: translateCommon("errorGeneric", locale),
    description:
      error instanceof Error ? error.message : translateCommon("errorGeneric", locale),
  });
}

/** Success feedback after mutations; resolves copy from static `common` catalog. */
export function toastMutationSuccess(locale: Locale = defaultLocale): void {
  toast({
    title: translateCommon("changesSaved", locale),
  });
}
