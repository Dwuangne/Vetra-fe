"use client";

import { useState } from "react";
import messages from "@/lib/i18n/messages.json";
import { pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import type { PublicScanResultDto } from "../model/public-scan.types";
import { parsePublicScanBatchStatus } from "../lib/batch-status";
import type { BatchStatus } from "@/lib/api/types/batch";
import { SafeImage } from "@/components/ui/safe-image";

import { formatPublicScanPartyLine } from "../lib/format-public-scan-party";

import { PublicScanShell } from "./public-scan-shell";

type PublicScanActiveProps = {
  data: PublicScanResultDto;
  locale: Locale;
};

function formatDateOnly(iso: string | null, locale: Locale): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(iso: string | null, locale: Locale): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function batchStatusLabel(status: BatchStatus | undefined, loc: Locale): string {
  if (!status) return "—";
  const row = messages.batch.status[status];
  return row ? pickLocalized(row, loc) : status;
}

export function PublicScanActive({ data, locale }: PublicScanActiveProps) {
  const { product, batch, productionOrder, factory, certificates } = data;
  const batchStatus = parsePublicScanBatchStatus(batch.status);
  const [imageIndex, setImageIndex] = useState(0);
  const images =
    product.images.length > 0 ? product.images : [null];
  const hasMultipleImages = product.images.length > 1;
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const goToNextImage = () => {
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevImage = () => {
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const authentic = pickLocalized(messages.publicScan.active.authenticBadge, locale);

  return (
    <PublicScanShell
      locale={locale}
      accent="rose"
      headerTitle={product.name || "—"}
      headerBadge={authentic}
    >
      <div className="space-y-4">
        <section className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-md">
          <SafeImage
            src={images[imageIndex]}
            alt={product.name}
            className="max-h-80 w-full object-cover"
            onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
            onTouchEnd={(event) => {
              if (!hasMultipleImages || touchStartX === null) return;
              const delta = event.changedTouches[0].clientX - touchStartX;
              if (Math.abs(delta) < 40) return;
              if (delta < 0) goToNextImage();
              if (delta > 0) goToPrevImage();
              setTouchStartX(null);
            }}
          />
          {hasMultipleImages ? (
            <div className="flex items-center justify-center gap-2 border-t border-rose-100 px-3 py-3">
              {images.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  aria-label={`Image ${index + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    imageIndex === index ? "bg-rose-500" : "bg-rose-200 hover:bg-rose-300"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </section>

        <p className="text-center text-sm text-zinc-600">
          {pickLocalized(messages.publicScan.active.gtinLabel, locale)}: {product.gtin}
        </p>

        {product.description ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              {pickLocalized(messages.publicScan.active.productSection, locale)}
            </h2>
            <div
              className="prose prose-sm mt-3 max-w-none text-zinc-700"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        ) : null}

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">
            {pickLocalized(messages.publicScan.active.batchSection, locale)}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-500">{pickLocalized(messages.publicScan.active.lotNumber, locale)}</p>
              <p className="font-medium">{batch.lotNumber}</p>
            </div>
            <div>
              <p className="text-zinc-500">
                {pickLocalized(messages.publicScan.active.manufactureDate, locale)}
              </p>
              <p className="font-medium text-emerald-700">{formatDateOnly(batch.manufactureDate, locale)}</p>
            </div>
            <div>
              <p className="text-zinc-500">{pickLocalized(messages.batch.fields.status, locale)}</p>
              <p className="font-medium">{batchStatusLabel(batchStatus, locale)}</p>
            </div>
            <div>
              <p className="text-zinc-500">{pickLocalized(messages.publicScan.active.expiryDate, locale)}</p>
              <p className="font-medium text-rose-700">{formatDateOnly(batch.expiryDate, locale)}</p>
            </div>
          </div>
          {productionOrder ? (
            <div className="mt-4 border-t border-zinc-100 pt-3 text-sm">
              <p className="font-medium text-zinc-900">
                {pickLocalized(messages.publicScan.active.productionOrderSection, locale)}
              </p>
              <p className="mt-1 text-zinc-600">{productionOrder.code}</p>
              <p className="mt-1 text-zinc-500">
                {pickLocalized(messages.publicScan.active.productionOrderDateRange, locale)}:{" "}
                {formatDateTime(productionOrder.startDate, locale)} –{" "}
                {formatDateTime(productionOrder.endDate, locale)}
              </p>
            </div>
          ) : null}
        </section>

        {factory ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              {pickLocalized(messages.publicScan.active.factorySection, locale)}
            </h2>
            <div className="mt-3 text-sm">
              <p className="font-semibold">{factory.name}</p>
              {factory.address ? (
                <div className="mt-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {pickLocalized(messages.publicScan.active.factoryAddressLabel, locale)}
                  </p>
                  <p className="text-zinc-700">{factory.address}</p>
                </div>
              ) : null}
              {factory.party ? (
                <div className="mt-4 border-t border-zinc-100 pt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {pickLocalized(messages.publicScan.active.partyLabel, locale)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-700">{formatPublicScanPartyLine(factory.party, locale)}</p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {certificates.length > 0 ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              {pickLocalized(messages.publicScan.active.certificatesSection, locale)}
            </h2>
            <div className="mt-3 space-y-2">
              {certificates.map((certificate) => (
                <div
                  key={`${certificate.name}-${certificate.url ?? ""}`}
                  className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
                >
                  <p className="text-sm font-semibold text-amber-900">{certificate.name}</p>
                  {certificate.url ? (
                    <a
                      href={certificate.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-amber-800 underline"
                    >
                      {pickLocalized(messages.publicScan.active.viewCertificate, locale)}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PublicScanShell>
  );
}
