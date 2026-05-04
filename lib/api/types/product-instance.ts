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

export type ProductInstanceListQuery = PagedListQuery & {
  batchId?: string;
};

export type GenerateProductInstancesRequest = {
  quantity: number;
  serialPrefix?: string | null;
};
