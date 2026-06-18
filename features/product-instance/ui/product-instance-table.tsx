"use client";

import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";

import type { ProductInstanceDto } from "@/lib/api/types/product-instance";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getPublicAppBaseUrl } from "@/lib/config/public-app-url";
import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import {
  buildPublicGs1ScanPath,
  buildPublicGs1ScanUrl,
  type ProductInstancePublicUrlState,
} from "@/lib/production/product-instance-public-url";
import { toast } from "@/hooks/use-toast";

import { SHOW_INSTANCE_EVENT_TIMELINE_LINK } from "../constants";

type ProductInstanceTableProps = {
  rows: ProductInstanceDto[];
  locale: Locale;
  loading?: boolean;
  gtin: string | null;
  publicUrlState: ProductInstancePublicUrlState;
};

export function ProductInstanceTable({
  rows,
  locale,
  loading,
  gtin,
  publicUrlState,
}: ProductInstanceTableProps) {
  const f = messages.productInstance.fields;
  const actions = messages.productInstance.actions;
  const pub = messages.production.instance;
  const baseUrl = getPublicAppBaseUrl();

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: pickLocalized(pub.linkCopied, locale) });
    } catch {
      /* clipboard unavailable */
    }
  };

  const showPublicActions = publicUrlState !== "hidden" && Boolean(gtin);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-max min-w-full border-collapse text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="p-3 text-left font-medium">{pickLocalized(f.serialNumber, locale)}</th>
              <th className="p-3 text-left font-medium">{pickLocalized(f.epcUri, locale)}</th>
              <th className="p-3 text-left font-medium">{pickLocalized(f.lotNumber, locale)}</th>
              <th className="p-3 text-left font-medium">{pickLocalized(pub.publicUrl, locale)}</th>
              {SHOW_INSTANCE_EVENT_TIMELINE_LINK ? (
                <th className="p-3 text-right font-medium">{pickLocalized(actions.viewEventTimeline, locale)}</th>
              ) : null}
            </tr>
          </thead>
          <tbody className={(loading ?? false) ? "opacity-60" : undefined}>
            {rows.map((row) => {
              const path =
                gtin && row.serialNumber ? buildPublicGs1ScanPath(gtin, row.serialNumber) : null;
              const absolute = path && baseUrl ? buildPublicGs1ScanUrl(baseUrl, gtin!, row.serialNumber) : path ?? "";

              return (
                <tr key={row.instanceId} className="border-b last:border-b-0">
                  <td className="max-w-[14rem] truncate p-3 font-mono text-xs">{row.serialNumber}</td>
                  <td className="max-w-[20rem] truncate p-3 font-mono text-xs text-muted-foreground">
                    {row.epcUri}
                  </td>
                  <td className="max-w-[12rem] truncate p-3 font-mono text-xs text-muted-foreground">
                    {row.lotNumber ?? row.batchId ?? "—"}
                  </td>
                  <td className="p-2 align-middle">
                    {!showPublicActions || !path ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-block cursor-default px-1 text-muted-foreground">—</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          {pickLocalized(pub.notPublicYet, locale)}
                        </TooltipContent>
                      </Tooltip>
                    ) : publicUrlState === "notice" ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className="inline-flex shrink-0 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-800"
                              tabIndex={0}
                            >
                              {pickLocalized(pub.noticePageLabel, locale)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            {pickLocalized(pub.noticePageTooltip, locale)}
                          </TooltipContent>
                        </Tooltip>
                        <Link
                          href={path}
                          className="max-w-[10rem] truncate font-mono text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {path}
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground"
                          aria-label={pickLocalized(pub.copyLink, locale)}
                          onClick={() => void copyUrl(absolute)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground"
                          asChild
                        >
                          <a
                            href={path}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={pickLocalized(pub.openInNewTab, locale)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          href={path}
                          className="max-w-[12rem] truncate font-mono text-xs text-primary underline-offset-2 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {path}
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          aria-label={pickLocalized(pub.copyLink, locale)}
                          onClick={() => void copyUrl(absolute)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                          <a href={path} target="_blank" rel="noopener noreferrer" aria-label={pickLocalized(pub.openInNewTab, locale)}>
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </td>
                  {SHOW_INSTANCE_EVENT_TIMELINE_LINK ? (
                    <td className="p-3 text-right">
                      {row.epcUri ? (
                        <Button type="button" variant="outline" size="sm" asChild>
                          <Link href={`/events?epcUri=${encodeURIComponent(row.epcUri)}`}>
                            {pickLocalized(actions.viewEventTimeline, locale)}
                          </Link>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}
