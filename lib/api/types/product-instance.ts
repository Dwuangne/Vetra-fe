import type { PagedListQuery } from "./common";

export type ProductInstanceDto = {
  instanceId: string;
  tenantId: string;
  productId: string;
  serialNumber: string;
  batchId: string | null;
  lotNumber: string | null;
  epcUri: string;
};

/** POST body for `/generate/{batchId}` — count and serials are determined on the server. */
export type GenerateProductInstancesRequest = Record<string, never>;

export type ProductInstanceListQuery = PagedListQuery & {
  batchId?: string;
};
