import messages from "@/lib/i18n/messages.json";
import { pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import type { PublicScanPartyDto } from "../model/public-scan.types";

export function formatPublicScanPartyLine(party: PublicScanPartyDto, locale: Locale): string {
  const name = party.name.trim();
  const gln = party.gln?.trim();
  if (gln) {
    return `${name} (${pickLocalized(messages.publicScan.active.partyGlnLabel, locale)}: ${gln})`;
  }

  const taxCode = party.taxCode?.trim();
  if (taxCode) {
    return `${name} (${pickLocalized(messages.publicScan.active.partyTaxCodeLabel, locale)}: ${taxCode})`;
  }

  return name;
}
