"use client";

import { useCallback, useEffect, useState } from "react";

import { ListLoadingSkeleton } from "@/components/list/list-loading-skeleton";
import { ListPagination } from "@/components/list/list-pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getBatchById } from "@/lib/api/services/batch.service";
import { getEventById, listEventEpcs } from "@/lib/api/services/event.service";
import { getProductionOrderById } from "@/lib/api/services/production-order.service";
import type { EventAttributeResult, EventEpcResult, EventResult } from "@/lib/api/types/event";
import { messages, pickLocalized, useLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { getAttributeDataTypeLabel } from "@/lib/production/attribute-data-types";
import { getBizStepLabel } from "@/lib/production/cbv-biz-steps";
import type { EpcListType } from "@/lib/production/epcis-constants";
import { toastApiError } from "@/lib/ui/api-toast";

const EPC_PAGE_SIZE = 20;

type EventDetailDialogProps = {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationNameById: Record<string, string>;
};

function formatDateTime(iso: string, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatNullable(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function getEpcTypeLabel(epcType: string, locale: Locale): string {
  const labels = messages.event.epcType;
  const row = labels[epcType as EpcListType];
  return row ? pickLocalized(row, locale) : epcType;
}

function formatAttributeValue(attr: EventAttributeResult, locale: Locale): string {
  switch (attr.dataType) {
    case "STRING":
      return formatNullable(attr.valString);
    case "NUMERIC":
      return attr.valNumeric != null ? String(attr.valNumeric) : "—";
    case "DATE":
      return attr.valTimestamp ? formatDateTime(attr.valTimestamp, locale) : "—";
    case "BOOLEAN": {
      if (attr.valString != null) return attr.valString;
      if (attr.valNumeric != null) return attr.valNumeric ? "true" : "false";
      return "—";
    }
    default:
      return (
        attr.valString ??
        (attr.valNumeric != null ? String(attr.valNumeric) : null) ??
        (attr.valTimestamp ? formatDateTime(attr.valTimestamp, locale) : null) ??
        "—"
      );
  }
}

function resolveLocationLabel(
  locationId: string | null,
  locationNameById: Record<string, string>
): string {
  if (!locationId) return "—";
  return locationNameById[locationId] ?? locationId;
}

type MixInputRow = Record<string, unknown>;

function parseMixInputs(raw: string | null): MixInputRow[] | null {
  if (!raw?.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((row): row is MixInputRow => typeof row === "object" && row !== null);
  } catch {
    return null;
  }
}

function mixInputCellValue(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function EventDetailDialog({
  eventId,
  open,
  onOpenChange,
  locationNameById,
}: EventDetailDialogProps) {
  const { locale } = useLocale();
  const d = messages.event.detail;
  const f = d.fields;

  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<EventResult | null>(null);
  const [productionOrderLabel, setProductionOrderLabel] = useState<string | null>(null);
  const [batchLotLabel, setBatchLotLabel] = useState<string | null>(null);
  const [epcCount, setEpcCount] = useState(0);
  const [epcs, setEpcs] = useState<EventEpcResult[]>([]);
  const [epcPage, setEpcPage] = useState(1);
  const [epcTotalPages, setEpcTotalPages] = useState(1);
  const [loadingEpcs, setLoadingEpcs] = useState(false);

  const resetEpcState = useCallback(() => {
    setEpcCount(0);
    setEpcs([]);
    setEpcPage(1);
    setEpcTotalPages(1);
    setLoadingEpcs(false);
  }, []);

  const loadEpcs = useCallback(
    async (page: number) => {
      if (!eventId) return;
      setLoadingEpcs(true);
      try {
        const res = await listEventEpcs(eventId, { page, size: EPC_PAGE_SIZE });
        setEpcs(res.data?.items ?? []);
        setEpcPage(res.data?.page ?? page);
        setEpcTotalPages(Math.max(1, res.data?.totalPages ?? 1));
      } catch (e) {
        toastApiError(e, locale);
        setEpcs([]);
        setEpcTotalPages(1);
      } finally {
        setLoadingEpcs(false);
      }
    },
    [eventId, locale]
  );

  const loadEvent = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setProductionOrderLabel(null);
    setBatchLotLabel(null);
    resetEpcState();
    try {
      const res = await getEventById(eventId);
      const data = res.data ?? null;
      setEvent(data);

      const count = data?.epcCount ?? data?.epcs?.length ?? 0;
      setEpcCount(count);

      if (data?.productionOrderId) {
        try {
          const poRes = await getProductionOrderById(data.productionOrderId);
          setProductionOrderLabel(poRes.data?.orderNumber ?? data.productionOrderId);
        } catch {
          setProductionOrderLabel(data.productionOrderId);
        }
      }

      if (data?.batchId) {
        try {
          const batchRes = await getBatchById(data.batchId);
          setBatchLotLabel(batchRes.data?.lotNumber ?? data.batchId);
        } catch {
          setBatchLotLabel(data.batchId);
        }
      }

      if (count > 0) {
        await loadEpcs(1);
      }
    } catch (e) {
      toastApiError(e, locale);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [eventId, locale, loadEpcs, resetEpcState]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setEvent(null);
        setLoading(false);
        resetEpcState();
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetEpcState]
  );

  const goEpcPage = useCallback(
    (page: number) => {
      setEpcPage(page);
      void loadEpcs(page);
    },
    [loadEpcs]
  );

  useEffect(() => {
    if (!open || !eventId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loadEvent() fetches detail when dialog opens
    void loadEvent();
  }, [open, eventId, loadEvent]);

  const mixInputsAttr = event?.attributes.find((attr) => attr.name === "mixInputs");
  const mixInputsRows = mixInputsAttr ? parseMixInputs(mixInputsAttr.valString) : null;
  const mixInputColumns =
    mixInputsRows && mixInputsRows.length > 0
      ? Array.from(
          mixInputsRows.reduce((keys, row) => {
            for (const key of Object.keys(row)) keys.add(key);
            return keys;
          }, new Set<string>())
        )
      : [];
  const hasAnchors = Boolean(event?.productionOrderId || event?.batchId);
  const hasLocation = Boolean(event?.readPointId || event?.bizLocationId);
  const epcTotalLabel = pickLocalized(d.epcs.total, locale).replace("{count}", String(epcCount));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{pickLocalized(d.title, locale)}</DialogTitle>
        </DialogHeader>

        {loading ? <ListLoadingSkeleton rows={4} columns={3} /> : null}

        {!loading && event ? (
          <div className="flex flex-col gap-5 py-2">
            <section>
              <h3 className="mb-2 text-sm font-medium">{pickLocalized(d.sections.summary, locale)}</h3>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">{pickLocalized(f.eventTime, locale)}</dt>
                  <dd className="text-base font-medium">{formatDateTime(event.eventTime, locale)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{pickLocalized(f.bizStep, locale)}</dt>
                  <dd className="text-base font-medium">
                    {event.bizStep ? getBizStepLabel(event.bizStep, locale) : "—"}
                  </dd>
                </div>
              </dl>
            </section>

            {hasAnchors ? (
              <section>
                <h3 className="mb-2 text-sm font-medium">{pickLocalized(d.sections.anchors, locale)}</h3>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">
                      {pickLocalized(d.fields.productionOrder, locale)}
                    </dt>
                    <dd>{productionOrderLabel ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{pickLocalized(d.fields.batchLot, locale)}</dt>
                    <dd>{batchLotLabel ?? "—"}</dd>
                  </div>
                </dl>
              </section>
            ) : null}

            <section>
              <h3 className="mb-2 text-sm font-medium">{pickLocalized(d.sections.attributes, locale)}</h3>
              {event.attributes.length === 0 ? (
                <p className="text-sm text-muted-foreground">{pickLocalized(d.emptyAttributes, locale)}</p>
              ) : (
                <div className="overflow-hidden rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50 text-left">
                          <th className="px-3 py-2 font-medium">{pickLocalized(d.attributes.name, locale)}</th>
                          <th className="px-3 py-2 font-medium">{pickLocalized(d.attributes.dataType, locale)}</th>
                          <th className="px-3 py-2 font-medium">{pickLocalized(d.attributes.value, locale)}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {event.attributes
                          .filter((attr) => attr.name !== "mixInputs" || !mixInputsRows)
                          .map((attr) => (
                            <tr key={attr.attrId} className="border-b last:border-0">
                              <td className="px-3 py-2">{attr.name}</td>
                              <td className="px-3 py-2 text-muted-foreground">
                                {getAttributeDataTypeLabel(attr.dataType, locale)}
                              </td>
                              <td className="px-3 py-2">{formatAttributeValue(attr, locale)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {mixInputsRows && mixInputsRows.length > 0 ? (
                <div className="mt-4">
                  <h4 className="mb-2 text-xs font-medium text-muted-foreground">
                    {pickLocalized(d.mixInputs.title, locale)}
                  </h4>
                  <div className="overflow-hidden rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[360px] text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50 text-left">
                            {mixInputColumns.map((col) => (
                              <th key={col} className="px-3 py-2 font-medium">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {mixInputsRows.map((row, index) => (
                            <tr key={index} className="border-b last:border-0">
                              {mixInputColumns.map((col) => (
                                <td key={col} className="px-3 py-2">
                                  {mixInputCellValue(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>

            {hasLocation ? (
              <section>
                <h3 className="mb-2 text-sm font-medium">{pickLocalized(d.sections.location, locale)}</h3>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">{pickLocalized(f.readPoint, locale)}</dt>
                    <dd>{resolveLocationLabel(event.readPointId, locationNameById)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{pickLocalized(f.bizLocation, locale)}</dt>
                    <dd>{resolveLocationLabel(event.bizLocationId, locationNameById)}</dd>
                  </div>
                </dl>
              </section>
            ) : null}

            {epcCount > 0 ? (
              <section>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-medium">{pickLocalized(d.sections.epcs, locale)}</h3>
                    <p className="text-xs text-muted-foreground">{epcTotalLabel}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void loadEpcs(epcPage)}
                    disabled={loadingEpcs}
                  >
                    {pickLocalized(d.epcs.refresh, locale)}
                  </Button>
                </div>

                {loadingEpcs ? <ListLoadingSkeleton rows={3} columns={3} /> : null}

                {!loadingEpcs && epcs.length > 0 ? (
                  <div className="overflow-hidden rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50 text-left">
                            <th className="px-3 py-2 font-medium">{pickLocalized(d.epcs.epcUri, locale)}</th>
                            <th className="px-3 py-2 font-medium">{pickLocalized(d.epcs.epcType, locale)}</th>
                            <th className="px-3 py-2 font-medium">{pickLocalized(d.epcs.batchId, locale)}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {epcs.map((epc) => (
                            <tr key={`${epc.instanceId}-${epc.epcType}`} className="border-b last:border-0">
                              <td className="max-w-[280px] truncate px-3 py-2 font-mono text-xs" title={epc.epcUri}>
                                {epc.epcUri}
                              </td>
                              <td className="px-3 py-2">{getEpcTypeLabel(epc.epcType, locale)}</td>
                              <td className="px-3 py-2 font-mono text-xs">{formatNullable(epc.batchId)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {!loadingEpcs && epcs.length > 0 && epcTotalPages > 1 ? (
                  <ListPagination
                    page={epcPage}
                    totalPages={epcTotalPages}
                    loading={loadingEpcs}
                    onPrev={() => goEpcPage(Math.max(1, epcPage - 1))}
                    onNext={() => goEpcPage(Math.min(epcTotalPages, epcPage + 1))}
                  />
                ) : null}
              </section>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            {pickLocalized(d.close, locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
