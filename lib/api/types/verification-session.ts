import type { PagedListQuery } from "./common";

/** BE serializes `VerificationSessionStatus` as integer. */
export type VerificationSessionStatus = 0 | 1 | 2;

/** BE serializes `VerificationAttachOutcome` as integer. */
export type VerificationAttachOutcome = 0 | 1 | 2 | 3 | 4 | 5;

export type VerificationSessionSummaryDto = {
  sessionId: string;
  productId: string;
  batchId: string;
  status: VerificationSessionStatus | number;
  openedAt: string;
  cancelledAt: string | null;
  completedAt: string | null;
  createdByUserId: string;
};

export type OpenVerificationSessionRequest = {
  batchId: string;
};

export type OpenVerificationSessionResult = {
  sessionId: string;
  sessionToken: string;
  productId: string;
  batchId: string;
  status: VerificationSessionStatus | number;
  openedAt: string;
};

export type VerificationAttachLineDto = {
  attachLineId: string;
  code: string;
  clientStatus: string;
  outcome: VerificationAttachOutcome | number;
  instanceId: string | null;
  createdAt: string;
};

export type VerificationSessionAttachStatsDto = {
  totalAttachLines: number;
};

export type VerificationSessionDetailDto = {
  session: VerificationSessionSummaryDto;
  attachStats: VerificationSessionAttachStatsDto;
};

export type VerificationSessionListQuery = PagedListQuery & {
  batchId?: string;
  productId?: string;
};

export type VerificationAttachLineListQuery = PagedListQuery & {
  outcome?: VerificationAttachOutcome | number;
  clientStatus?: string;
  keyword?: string;
};
