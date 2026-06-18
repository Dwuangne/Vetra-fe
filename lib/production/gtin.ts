/** GTIN path segment as stored on product — no leading-zero padding. */
export function toGtinPathSegment(gtin: string): string {
  return gtin.trim();
}
