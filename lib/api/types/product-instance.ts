import type { PagedListQuery } from "./common";

/** BE serializes `ProductInstanceStatus` as integer. */
export type ProductInstanceStatus = 0 | 1 | 2;

export type ProductInstanceDto = {
  instanceId: string;
  tenantId: string;
  productId: string;
  serialNumber: string;
  batchId: string | null;
  lotNumber: string | null;
  epcUri: string;
  instanceStatus: ProductInstanceStatus | number;
  generationId: string | null;
  exportedAt: string | null;
};

/** POST body for `/generate/{batchId}` — count and serials are determined on the server. */
export type GenerateProductInstancesRequest = Record<string, never>;

export type PreGenerateProductInstancesRequest = {
  productId: string;
  quantity: number;
};

export type PreGenerateProductInstancesResult = {
  generationId: string;
  instances: ProductInstanceDto[];
};

export type ProductInstanceListQuery = PagedListQuery & {
  batchId?: string;
  productId?: string;
  inPool?: boolean;
  generationId?: string;
};
