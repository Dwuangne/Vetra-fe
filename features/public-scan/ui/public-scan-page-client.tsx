"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { getPublicScan } from "@/lib/api/services/public-scan.service";
import { ApiHttpError } from "@/lib/api/errors";
import messages from "@/lib/i18n/messages.json";
import { pickLocalized, useLocale } from "@/lib/i18n";
import { resolveApiErrorMessage } from "@/lib/i18n/resolve-api-error";
import type { PublicScanResultDto } from "../model/public-scan.types";

import { PublicScanActive } from "./public-scan-active";
import { PublicScanInvalid } from "./public-scan-invalid";
import { PublicScanNotice } from "./public-scan-notice";
import { PublicScanShell } from "./public-scan-shell";

type ViewState =
  | { phase: "loading" }
  | { phase: "ready"; data: PublicScanResultDto }
  | { phase: "notfound" }
  | { phase: "invalid"; message: string }
  | { phase: "error"; message: string };

type PublicScanPageClientProps = {
  gtin: string;
  serial: string;
};

export function PublicScanPageClient({ gtin, serial }: PublicScanPageClientProps) {
  const { locale } = useLocale();
  const localeRef = useRef(locale);
  localeRef.current = locale;

  const [state, setState] = useState<ViewState>({ phase: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ phase: "loading" });

    void (async () => {
      try {
        const data = await getPublicScan(gtin, serial);
        if (cancelled) return;
        setState({ phase: "ready", data });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiHttpError) {
          if (err.status === 404) {
            setState({ phase: "notfound" });
            return;
          }
          if (err.status === 400) {
            setState({ phase: "invalid", message: resolveApiErrorMessage(err, localeRef.current) });
            return;
          }
        }
        const fallback = pickLocalized(messages.publicScan.client.loadError, localeRef.current);
        setState({
          phase: "error",
          message: err instanceof Error ? err.message || fallback : fallback,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // Fixed-length deps only: do not list `locale` here so changing language does not refetch scan data.
    // Use `localeRef` inside the effect for error copy at failure time.
  }, [gtin, serial, reloadToken]);

  if (state.phase === "loading") {
    return (
      <PublicScanShell
        locale={locale}
        accent="rose"
        headerTitle={pickLocalized(messages.publicScan.client.loading, locale)}
      >
        <div className="flex justify-center py-12">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600"
            aria-hidden
          />
        </div>
      </PublicScanShell>
    );
  }

  if (state.phase === "ready") {
    if (state.data.visibility === "notice") {
      return <PublicScanNotice data={state.data} locale={locale} />;
    }
    return <PublicScanActive data={state.data} locale={locale} />;
  }

  if (state.phase === "invalid") {
    return <PublicScanInvalid locale={locale} message={state.message} />;
  }

  if (state.phase === "notfound") {
    const msg = pickLocalized(messages.errors.PUB_001, locale);
    return (
      <PublicScanShell
        locale={locale}
        accent="rose"
        headerTitle={pickLocalized(messages.publicScan.invalidRequest.title, locale)}
      >
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-800">{msg}</div>
      </PublicScanShell>
    );
  }

  return (
    <PublicScanShell
      locale={locale}
      accent="rose"
      headerTitle={pickLocalized(messages.publicScan.invalidRequest.title, locale)}
    >
      <div className="space-y-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-950">
        <p>{state.message}</p>
        <Button type="button" variant="outline" onClick={() => setReloadToken((n) => n + 1)}>
          {pickLocalized(messages.publicScan.client.retry, locale)}
        </Button>
      </div>
    </PublicScanShell>
  );
}
