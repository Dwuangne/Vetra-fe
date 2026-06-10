export function normalizeNavQuery(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function navItemMatchesQuery(label: string, href: string, query: string): boolean {
  const q = normalizeNavQuery(query);
  if (!q) return true;
  return normalizeNavQuery(label).includes(q) || normalizeNavQuery(href).includes(q);
}
