import { ApiHttpError } from "@/lib/api/errors";
import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

/**
 * First validation message per field name (API contract: arrays per key).
 */
export function flattenApiFieldErrors(
  errors: Record<string, string[]> | null | undefined
): Record<string, string> {
  if (!errors) return {};
  const out: Record<string, string> = {};
  for (const [field, msgs] of Object.entries(errors)) {
    const first = msgs?.[0];
    if (first) out[field] = first;
  }
  return out;
}

/**
 * Maps ASP.NET-style validation payload onto react-hook-form `setError`,
 * using the first message per property key.
 *
 * Returns how many fields were populated (useful to detect unmatched keys).
 */
export function applyApiValidationErrors<T extends FieldValues>(
  apiErrors: Record<string, string[]> | null | undefined,
  setError: UseFormSetError<T>
): number {
  if (!apiErrors) return 0;
  let count = 0;
  for (const [field, msgs] of Object.entries(apiErrors)) {
    const first = msgs?.[0];
    if (!first) continue;
    setError(field as FieldPath<T>, { type: "server", message: first });
    count += 1;
  }
  return count;
}

/**
 * Convenience: clears nothing (callers typically `clearErrors()` before submit);
 * extracts `errors` from {@link ApiHttpError} when present.
 */
export function validationErrorsFromApiError(
  error: unknown
): Record<string, string[]> | null | undefined {
  if (error instanceof ApiHttpError) {
    return error.errors ?? undefined;
  }
  return undefined;
}
