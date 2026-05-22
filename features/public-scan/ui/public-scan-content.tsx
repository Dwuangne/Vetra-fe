"use client";

import { X } from "lucide-react";
import { useState } from "react";
import messages from "@/lib/i18n/messages.json";
import { pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import type { PublicScanResultDto } from "../model/public-scan.types";
import { parsePublicScanBatchStatus } from "../lib/batch-status";
import {
  formatPublicScanDateOnly,
  formatPublicScanDateTime,
  publicScanBatchStatusLabel,
} from "../lib/public-scan-format";
import { formatPublicScanPartyLine } from "../lib/format-public-scan-party";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SafeImage } from "@/components/ui/safe-image";
import { isCertificateImageUrl } from "../lib/certificate-url";

type PublicScanContentProps = {
  data: PublicScanResultDto;
  locale: Locale;
  /** Border/tint for the image card (active vs notice). */
  imageAccent?: "green" | "red";
};

export function PublicScanContent({ data, locale, imageAccent = "green" }: PublicScanContentProps) {
  const { product, batch, productionOrder, factory, certificates } = data;
  const batchStatus = parsePublicScanBatchStatus(batch.status);
  const [imageIndex, setImageIndex] = useState(0);
  const images = product.images.filter((url) => url?.trim());
  const hasMultipleImages = images.length > 1;
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const imageBorder = imageAccent === "red" ? "border-red-100" : "border-emerald-100";
  const imageDotActive = imageAccent === "red" ? "bg-red-500" : "bg-emerald-500";
  const imageDotIdle =
    imageAccent === "red" ? "bg-red-200 hover:bg-red-300" : "bg-emerald-200 hover:bg-emerald-300";

  const goToNextImage = () => setImageIndex((prev) => (prev + 1) % images.length);
  const goToPrevImage = () => setImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="space-y-4">
      {images.length > 0 ? (
        <section className={`overflow-hidden rounded-2xl border ${imageBorder} bg-white shadow-md`}>
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
            <div className={`flex items-center justify-center gap-2 border-t ${imageBorder} px-3 py-3`}>
              {images.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  aria-label={`Image ${index + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    imageIndex === index ? imageDotActive : imageDotIdle
                  }`}
                />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <p className="text-center text-sm text-zinc-600">
        {pickLocalized(messages.publicScan.active.gtinLabel, locale)}: {product.gtin}
      </p>

      {product.description?.trim() ? (
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
            <p className="font-medium text-emerald-700">
              {formatPublicScanDateOnly(batch.manufactureDate, locale)}
            </p>
          </div>
          <div>
            <p className="text-zinc-500">{pickLocalized(messages.batch.fields.status, locale)}</p>
            <p className="font-medium">{publicScanBatchStatusLabel(batchStatus, locale)}</p>
          </div>
          <div>
            <p className="text-zinc-500">{pickLocalized(messages.publicScan.active.expiryDate, locale)}</p>
            <p className="font-medium text-red-700">
              {formatPublicScanDateOnly(batch.expiryDate, locale)}
            </p>
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
              {formatPublicScanDateTime(productionOrder.startDate, locale)} –{" "}
              {formatPublicScanDateTime(productionOrder.endDate, locale)}
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
            {factory.address?.trim() ? (
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
                <p className="mt-1 text-sm text-zinc-700">
                  {formatPublicScanPartyLine(factory.party, locale)}
                </p>
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
                  isCertificateImageUrl(certificate.url) ? (
                    <button
                      type="button"
                      className="text-sm font-medium text-amber-800 underline hover:text-amber-950"
                      onClick={() => setPreviewImageUrl(certificate.url!.trim())}
                    >
                      {pickLocalized(messages.publicScan.active.viewCertificate, locale)}
                    </button>
                  ) : (
                    <a
                      href={certificate.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-amber-800 underline"
                    >
                      {pickLocalized(messages.publicScan.active.viewCertificate, locale)}
                    </a>
                  )
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <Dialog open={previewImageUrl !== null} onOpenChange={(open) => !open && setPreviewImageUrl(null)}>
        <DialogContent
          className="max-w-[min(95vw,900px)] border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button]:hidden [&>div]:overflow-visible [&>div]:p-0 [&>div]:pt-0"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">
            {pickLocalized(messages.publicScan.active.viewCertificate, locale)}
          </DialogTitle>
          {previewImageUrl ? (
            <>
              <button
                type="button"
                className="fixed right-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white shadow-lg ring-2 ring-white/30 transition hover:bg-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={() => setPreviewImageUrl(null)}
                aria-label={pickLocalized(messages.publicScan.active.closeCertificatePreview, locale)}
              >
                <X className="h-6 w-6" aria-hidden />
              </button>
              <SafeImage
                src={previewImageUrl}
                alt=""
                className="max-h-[min(85vh,100dvh)] w-full object-contain"
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
