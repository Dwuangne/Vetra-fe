import messages from "@/lib/i18n/messages.json";
import { pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import type { BatchStatus } from "@/lib/api/types/batch";
import type { PublicScanResultDto } from "../model/public-scan.types";
import { parsePublicScanBatchStatus } from "../lib/batch-status";
import { formatPublicScanPartyLine } from "../lib/format-public-scan-party";
import { noticeReasonBadgeKey, noticeReasonBodyKey } from "../lib/notice-reason";

import { PublicScanShell } from "./public-scan-shell";

type PublicScanNoticeProps = {
  data: PublicScanResultDto;
  locale: Locale;
};

function batchStatusLabel(status: BatchStatus | undefined, loc: Locale): string {
  if (!status) return "—";
  const row = messages.batch.status[status];
  return row ? pickLocalized(row, loc) : status;
}

export function PublicScanNotice({ data, locale }: PublicScanNoticeProps) {
  const { product, batch, factory } = data;
  const body = pickLocalized(noticeReasonBodyKey(data.noticeReason), locale);
  const headerBadge = pickLocalized(noticeReasonBadgeKey(data.noticeReason), locale);
  const batchStatus = parsePublicScanBatchStatus(batch.status);
  const factoryName = factory?.name?.trim();
  const factoryAddress = factory?.address?.trim();
  const partyLine = factory?.party ? formatPublicScanPartyLine(factory.party, locale) : null;

  return (
    <PublicScanShell
      locale={locale}
      accent="red"
      footerVariant="notice"
      headerTitle={pickLocalized(messages.publicScan.notice.title, locale)}
      headerBadge={headerBadge}
    >
      <div className="space-y-4">
        <div
          role="alert"
          className="rounded-2xl border border-red-300 bg-red-50 px-4 py-4 text-sm text-red-950 shadow-sm"
        >
          <p className="font-semibold leading-relaxed">{body}</p>
          <p className="mt-3 leading-relaxed text-red-900">
            {pickLocalized(messages.publicScan.notice.contactSupport, locale)}
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">{product.name || "—"}</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {pickLocalized(messages.publicScan.active.gtinLabel, locale)}: {product.gtin}
          </p>
          <p className="mt-3 text-sm text-zinc-600">
            {pickLocalized(messages.publicScan.active.lotNumber, locale)}: {batch.lotNumber}
          </p>
          <p className="mt-2 text-sm font-medium text-red-800">
            {pickLocalized(messages.publicScan.notice.batchStatusLabel, locale)}:{" "}
            {batchStatusLabel(batchStatus, locale)}
          </p>
          {factoryName ? (
            <p className="mt-2 text-sm text-zinc-600">
              {pickLocalized(messages.publicScan.notice.factoryLabel, locale)}: {factoryName}
            </p>
          ) : null}
          {factoryAddress ? (
            <p className="mt-2 text-sm text-zinc-600">
              {pickLocalized(messages.publicScan.active.factoryAddressLabel, locale)}: {factoryAddress}
            </p>
          ) : null}
          {partyLine ? (
            <p className="mt-2 text-sm text-zinc-600">
              {pickLocalized(messages.publicScan.active.partyLabel, locale)}: {partyLine}
            </p>
          ) : null}
        </section>
      </div>
    </PublicScanShell>
  );
}
