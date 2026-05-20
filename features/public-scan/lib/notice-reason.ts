import messages from "@/lib/i18n/messages.json";
import type { PublicScanNoticeReason } from "../model/public-scan.types";

export function noticeReasonBadgeKey(reason: PublicScanNoticeReason | null | undefined) {
  switch (reason) {
    case "quarantined":
      return messages.publicScan.notice.badges.quarantined;
    case "destroyed":
      return messages.publicScan.notice.badges.destroyed;
    case "recalled":
    default:
      return messages.publicScan.notice.badges.recalled;
  }
}

export function noticeReasonBodyKey(reason: PublicScanNoticeReason | null | undefined) {
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
