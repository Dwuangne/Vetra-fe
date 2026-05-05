import { getApiBaseUrl } from "./config";
import type { ApiResponse } from "./types/api-response";
import { ApiHttpError } from "./errors";
import { clearSession, getSession, isAuthenticated } from "@/lib/auth/auth-storage";

type JsonRequestInit = Omit<RequestInit, "body"> & {
  body?: object;
};

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/** GET without auth header; does not clear session on 401. */
export async function apiGetPublic<T>(
  path: string,
  init?: Omit<JsonRequestInit, "body" | "method">
): Promise<ApiResponse<T>> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const { headers, ...rest } = init ?? {};
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  const response = await fetch(url, {
    ...rest,
    method: "GET",
    headers: requestHeaders,
    cache: rest.cache ?? "no-store",
  });

  const payload = (await parseJsonSafe(response)) as ApiResponse<T> | null;

  if (!response.ok) {
    const message =
      payload?.message ?? response.statusText ?? `Request failed (${response.status})`;
    throw new ApiHttpError(message, response.status, {
      errorCode: payload?.errorCode,
      errors: payload?.errors ?? undefined,
    });
  }

  if (payload === null) {
    throw new ApiHttpError("Empty response from server", response.status);
  }

  return payload;
}

/** JSON API call; non-OK throws {@link ApiHttpError}. */
export async function apiRequest<T>(
  path: string,
  init: JsonRequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const { body, headers, ...rest } = init;
  const session = getSession();
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  requestHeaders.set("Content-Type", "application/json");
  if (session && isAuthenticated()) {
    requestHeaders.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = (await parseJsonSafe(response)) as ApiResponse<T> | null;

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }
    const message =
      payload?.message ??
      response.statusText ??
      `Request failed (${response.status})`;
    throw new ApiHttpError(message, response.status, {
      errorCode: payload?.errorCode,
      errors: payload?.errors ?? undefined,
    });
  }

  if (payload === null) {
    throw new ApiHttpError("Empty response from server", response.status);
  }

  return payload;
}

export function apiPost<T>(
  path: string,
  body?: object,
  init?: Omit<JsonRequestInit, "body" | "method">
) {
  return apiRequest<T>(path, { ...init, method: "POST", body });
}

export function apiGet<T>(path: string, init?: Omit<JsonRequestInit, "body" | "method">) {
  return apiRequest<T>(path, { ...init, method: "GET" });
}

export type ApiGetBlobResult = { blob: Blob; filename?: string };

/** Authenticated GET for non-JSON bodies (e.g. CSV). Parses JSON error bodies on failure. */
export async function apiGetBlob(path: string, init?: Omit<RequestInit, "body" | "method">): Promise<ApiGetBlobResult> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const session = getSession();
  const requestHeaders = new Headers(init?.headers);
  requestHeaders.set("Accept", "text/csv,*/*");
  if (session && isAuthenticated()) {
    requestHeaders.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(url, {
    ...init,
    method: "GET",
    headers: requestHeaders,
    cache: init?.cache ?? "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }
    const text = await response.text();
    const payload = (() => {
      try {
        return JSON.parse(text) as ApiResponse<unknown>;
      } catch {
        return null;
      }
    })();
    const message =
      payload?.message ??
      response.statusText ??
      `Request failed (${response.status})`;
    throw new ApiHttpError(message, response.status, {
      errorCode: payload?.errorCode,
      errors: payload?.errors ?? undefined,
    });
  }

  const blob = await response.blob();
  const filename = filenameFromContentDisposition(response.headers.get("Content-Disposition"));
  return { blob, filename };
}

function filenameFromContentDisposition(header: string | null): string | undefined {
  if (!header) return undefined;
  const utf8 = /filename\*=UTF-8''([^;\s]+)/i.exec(header);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1]);
    } catch {
      return utf8[1];
    }
  }
  const quoted = /filename="([^"]+)"/i.exec(header);
  if (quoted?.[1]) return quoted[1];
  const plain = /filename=([^;\s]+)/i.exec(header);
  if (plain?.[1]) return plain[1].replace(/^"(.*)"$/, "$1");
  return undefined;
}
