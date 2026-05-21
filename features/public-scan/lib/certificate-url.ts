/** True when URL path looks like a raster/SVG image (preview in dialog). */
export function isCertificateImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const path = new URL(trimmed).pathname;
    return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(path);
  } catch {
    return /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(trimmed);
  }
}
