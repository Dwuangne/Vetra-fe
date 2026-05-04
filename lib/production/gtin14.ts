/** Left-pad GTIN digits to 14 for GS1 Digital Link path (aligns with BE normalization). */
export function toGtin14PathSegment(gtin: string): string {
  const digits = gtin.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length > 14) return digits.slice(-14);
  return digits.padStart(14, "0");
}
