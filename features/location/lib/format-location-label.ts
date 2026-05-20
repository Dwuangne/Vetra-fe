/** SGLN display id (GLN.extension), or null when GLN is absent. */
export function formatLocationSglnId(
  gln: string | null | undefined,
  extension?: string | null
): string | null {
  const g = gln?.trim();
  if (!g) return null;
  const ext = extension?.trim() || "0";
  return `${g}.${ext}`;
}

export function formatLocationOptionLabel(
  name: string,
  gln?: string | null,
  extension?: string | null
): string {
  const id = formatLocationSglnId(gln, extension);
  return id ? `${name} (${id})` : name;
}
