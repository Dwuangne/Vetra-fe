/** API base URL (browser and server both use `NEXT_PUBLIC_*`). */
export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!base) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_BASE_URL. Set it in .env.local (or Docker build args) to your API origin."
    );
  }
  return base.replace(/\/$/, "");
}
