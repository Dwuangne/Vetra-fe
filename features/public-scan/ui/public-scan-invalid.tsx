import messages from "@/lib/i18n/messages.json";
import { pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { PublicScanShell } from "./public-scan-shell";

type PublicScanInvalidProps = {
  locale: Locale;
  message: string;
};

export function PublicScanInvalid({ locale, message }: PublicScanInvalidProps) {
  return (
    <PublicScanShell
      locale={locale}
      accent="rose"
      headerTitle={pickLocalized(messages.publicScan.invalidRequest.title, locale)}
    >
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
        {message}
      </div>
    </PublicScanShell>
  );
}
