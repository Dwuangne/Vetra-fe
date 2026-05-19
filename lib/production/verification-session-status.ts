export type VerificationSessionStatusLabel = "Open" | "Cancelled" | "Completed";

const SESSION_STATUS_LABELS: VerificationSessionStatusLabel[] = ["Open", "Cancelled", "Completed"];

export function normalizeVerificationSessionStatus(status: unknown): VerificationSessionStatusLabel {
  if (typeof status === "number") {
    return SESSION_STATUS_LABELS[status] ?? "Open";
  }

  if (typeof status === "string") {
    const numeric = Number(status);
    if (!Number.isNaN(numeric) && Number.isInteger(numeric)) {
      return SESSION_STATUS_LABELS[numeric] ?? "Open";
    }
    if ((SESSION_STATUS_LABELS as string[]).includes(status)) {
      return status as VerificationSessionStatusLabel;
    }
  }

  return "Open";
}

export function isVerificationSessionOpen(status: unknown): boolean {
  return normalizeVerificationSessionStatus(status) === "Open";
}
