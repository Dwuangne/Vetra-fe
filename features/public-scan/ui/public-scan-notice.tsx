import messages from "@/lib/i18n/messages.json";
import { pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import type { PublicScanResultDto } from "../model/public-scan.types";
import { PublicScanShell } from "./public-scan-shell";

type PublicScanNoticeProps = {
  data: PublicScanResultDto;
  locale: Locale;
};

function noticeRow(reason: PublicScanResultDto["noticeReason"]) {
  switch (reason) {
    case "quarantined":
      return messages.publicScan.notice.quarantined;
    case "destroyed":
      return messages.publicScan.notice.destroyed;
    case "recalled":
    default:
      return messages.publicScan.notice.recalled;
  }
}

export function PublicScanNotice({ data, locale }: PublicScanNoticeProps) {
  const { product, batch, factory } = data;
  const body = pickLocalized(noticeRow(data.noticeReason), locale);
  const factoryName = factory?.name?.trim();
  const factoryAddress = factory?.address?.trim();
  const partyLine =
    factory?.party != null
      ? `${factory.party.name} (${factory.party.gln})`
      : null;

  return (
    <PublicScanShell
      locale={locale}
      accent="red"
      headerTitle={pickLocalized(messages.publicScan.notice.title, locale)}
    >
      <div className="space-y-4">
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-950 shadow-sm"
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

        {product.images[0] ? (
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md">
            <img src={product.images[0]} alt={product.name} className="max-h-72 w-full object-cover" />
          </section>
        ) : null}
      </div>
    </PublicScanShell>
  );
}
