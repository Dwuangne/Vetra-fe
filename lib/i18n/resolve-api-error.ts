import type { ApiHttpError } from "@/lib/api/errors";
import { defaultLocale, translateErrorCode } from "./translate";
import type { Locale } from "./types";

/**
 * User-facing message for an API failure: catalog by `errorCode` + locale, else server `message`.
 */
export function resolveApiErrorMessage(
  error: ApiHttpError,
  locale: Locale = defaultLocale
): string {
  if (error.errorCode) {
    const localized = translateErrorCode(error.errorCode, locale);
    if (localized) return localized;
  }
  return error.message;
}
