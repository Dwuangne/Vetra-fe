import messages from "./messages.json";
import type { Locale, LocalizedString } from "./types";

const defaultLocale = messages.meta.defaultLocale as Locale;

function pick(locale: Locale, row: { en: string; vi: string }): string {
  return row[locale] ?? row[defaultLocale] ?? row.en;
}

/** Resolves a bilingual leaf from `messages.json` for the active locale. */
export function pickLocalized(row: LocalizedString, locale: Locale): string {
  return row[locale] ?? row[defaultLocale] ?? row.en;
}

/**
 * Message for API / domain error codes (matches {@link AppHttpError.errorCode}, Vetra-be AppError.Codes).
 * Falls back to `undefined` when the code has no catalog entry — use server `message` then.
 */
export function translateErrorCode(code: string, locale: Locale): string | undefined {
  const row = messages.errors[code as keyof typeof messages.errors];
  if (!row) return undefined;
  return pick(locale, row);
}

/**
 * Static UI strings (loading, branding, generic fallbacks).
 */
export function translateCommon(key: keyof typeof messages.common, locale: Locale): string {
  const row = messages.common[key];
  return pick(locale, row);
}

export { messages, defaultLocale };
