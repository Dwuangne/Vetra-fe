import type { ReadonlyURLSearchParams } from "next/navigation";

/** Shared list query shape for tenant/party/product/location tables and API callers. */

export type ListSortDirection = "asc" | "desc";

export type ListParams = Readonly<{
  /** 1-based page index */
  page: number;
  pageSize: number;
  /** Free-text filter (often mapped to BE `q` or `keyword`) */
  q?: string;
  sort?: string;
  sortDir?: ListSortDirection;
}>;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 200;

function clampPageSize(n: number): number {
  if (!Number.isFinite(n) || n < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.floor(n), MAX_PAGE_SIZE);
}

function clampPage(n: number): number {
  if (!Number.isFinite(n) || n < 1) return DEFAULT_PAGE;
  return Math.floor(n);
}

function parseSortDir(raw: string | undefined): ListSortDirection | undefined {
  if (raw === "asc" || raw === "desc") return raw;
  return undefined;
}

function parseOptionalInt(
  raw: string | undefined,
  fallback: number,
  clamp: (n: number) => number
): number {
  if (raw === undefined || raw === "") return clamp(fallback);
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return clamp(fallback);
  return clamp(n);
}

function getParam(
  input: URLSearchParams | ReadonlyURLSearchParams | Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  if (typeof (input as URLSearchParams).get === "function") {
    return (input as URLSearchParams).get(key) ?? undefined;
  }
  const raw = (input as Record<string, string | string[] | undefined>)[key];
  if (raw === undefined) return undefined;
  return Array.isArray(raw) ? raw[0] : raw;
}

/**
 * Parses list query params from `URLSearchParams`, `ReadonlyURLSearchParams`,
 * or a plain object such as Next.js `searchParams`.
 */
export function parseListSearchParams(
  input: URLSearchParams | ReadonlyURLSearchParams | Record<string, string | string[] | undefined>
): ListParams {
  const pageRaw = getParam(input, "page");
  const pageSizeRaw = getParam(input, "pageSize");
  const q = getParam(input, "q");
  const sort = getParam(input, "sort");
  const sortDir = parseSortDir(getParam(input, "sortDir"));

  const pageSize = clampPageSize(parseOptionalInt(pageSizeRaw, DEFAULT_PAGE_SIZE, clampPageSize));

  const page = clampPage(parseOptionalInt(pageRaw, DEFAULT_PAGE, clampPage));

  return {
    page,
    pageSize,
    ...(q !== undefined && q !== "" ? { q } : {}),
    ...(sort !== undefined && sort !== "" ? { sort } : {}),
    ...(sortDir !== undefined ? { sortDir } : {}),
  };
}

/**
 * Builds a relative query string omitting redundant default values.
 */
export function stringifyListParams(params: Partial<ListParams>): string {
  const sp = new URLSearchParams();
  const page = params.page ?? DEFAULT_PAGE;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  if (page !== DEFAULT_PAGE) sp.set("page", String(page));
  if (pageSize !== DEFAULT_PAGE_SIZE) sp.set("pageSize", String(pageSize));
  if (params.q) sp.set("q", params.q);
  if (params.sort) sp.set("sort", params.sort);
  if (params.sortDir) sp.set("sortDir", params.sortDir);
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export function isDefaultListPage(params: Pick<ListParams, "page">): boolean {
  return params.page === DEFAULT_PAGE;
}

const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Parses a single GUID query param; returns undefined when missing or invalid. */
export function parseGuidQueryParam(raw: string | null | undefined): string | undefined {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed || !GUID_RE.test(trimmed)) return undefined;
  return trimmed;
}
