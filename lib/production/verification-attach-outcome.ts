import type { VerificationAttachOutcome } from "@/lib/api/types/verification-session";

export type VerificationAttachOutcomeLabel =
  | "Committed"
  | "Rejected"
  | "Skipped"
  | "InvalidClientStatus"
  | "InstanceNotFound"
  | "AlreadyCommitted";

const OUTCOME_LABELS: VerificationAttachOutcomeLabel[] = [
  "Committed",
  "Rejected",
  "Skipped",
  "InvalidClientStatus",
  "InstanceNotFound",
  "AlreadyCommitted",
];

export function normalizeVerificationAttachOutcome(outcome: unknown): VerificationAttachOutcomeLabel {
  if (typeof outcome === "number") {
    return OUTCOME_LABELS[outcome] ?? "Skipped";
  }

  if (typeof outcome === "string") {
    const numeric = Number(outcome);
    if (!Number.isNaN(numeric) && Number.isInteger(numeric)) {
      return OUTCOME_LABELS[numeric] ?? "Skipped";
    }
    if ((OUTCOME_LABELS as string[]).includes(outcome)) {
      return outcome as VerificationAttachOutcomeLabel;
    }
  }

  return "Skipped";
}
