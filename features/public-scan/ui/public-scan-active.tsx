"use client";

import messages from "@/lib/i18n/messages.json";
import { pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import type { PublicScanResultDto } from "../model/public-scan.types";

import { PublicScanContent } from "./public-scan-content";
import { PublicScanShell } from "./public-scan-shell";

type PublicScanActiveProps = {
  data: PublicScanResultDto;
  locale: Locale;
};

export function PublicScanActive({ data, locale }: PublicScanActiveProps) {
  const authentic = pickLocalized(messages.publicScan.active.authenticBadge, locale);

  return (
    <PublicScanShell
      locale={locale}
      accent="rose"
      headerTitle={data.product.name || "—"}
      headerBadge={authentic}
    >
      <PublicScanContent data={data} locale={locale} imageAccent="rose" />
    </PublicScanShell>
  );
}
