import type { BatchStatus } from "./batch";

/** Wire shape from GET /api/public/v1/01/{gtin}/21/{serial} (camelCase). */
export type PublicScanVisibility = "active" | "notice";

export type PublicScanNoticeReason = "recalled" | "quarantined" | "destroyed";

export type PublicScanProductDto = {
  gtin: string;
  name: string;
  description: string | null;
  images: string[];
};

/** BE serializes `BatchStatus` as integer by default. */
export type PublicScanBatchDto = {
  lotNumber: string;
  manufactureDate: string | null;
  expiryDate: string | null;
  status: BatchStatus | number;
};

export type PublicScanProductionOrderDto = {
  code: string;
  startDate: string | null;
  endDate: string | null;
};

export type PublicScanPartyDto = {
  name: string;
  gln: string | null;
  taxCode: string | null;
};

export type PublicScanFactoryDto = {
  name: string;
  address: string | null;
  party: PublicScanPartyDto | null;
};

export type PublicScanCertificateDto = {
  name: string;
  url: string | null;
};

export type PublicScanResultDto = {
  visibility: PublicScanVisibility;
  noticeReason: PublicScanNoticeReason | null;
  product: PublicScanProductDto;
  batch: PublicScanBatchDto;
  productionOrder: PublicScanProductionOrderDto | null;
  factory: PublicScanFactoryDto | null;
  certificates: PublicScanCertificateDto[];
};
