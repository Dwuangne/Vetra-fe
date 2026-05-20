import messages from "@/lib/i18n/messages.json";
import { pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import type { PublicScanResultDto } from "../model/public-scan.types";
import { noticeReasonBadgeKey, noticeReasonBodyKey } from "../lib/notice-reason";

import { PublicScanContent } from "./public-scan-content";
import { PublicScanShell } from "./public-scan-shell";

type PublicScanNoticeProps = {
  data: PublicScanResultDto;
  locale: Locale;
};

export function PublicScanNotice({ data, locale }: PublicScanNoticeProps) {
  const body = pickLocalized(noticeReasonBodyKey(data.noticeReason), locale);
  const headerBadge = pickLocalized(noticeReasonBadgeKey(data.noticeReason), locale);

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

        <PublicScanContent data={data} locale={locale} imageAccent="red" />
      </div>
    </PublicScanShell>
  );
}
