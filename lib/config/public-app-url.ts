/**
 * Frontend origin for absolute public GS1 links. Optional `NEXT_PUBLIC_APP_URL`; otherwise
 * `window.location.origin` on the client.
 */
export function getPublicAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) {
    return raw.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}
