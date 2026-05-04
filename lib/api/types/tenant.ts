import type { PagedListQuery } from "./common";

export type TenantDto = {
  tenantId: string;
  name: string;
  gcp: string | null;
};

export type TenantListQuery = PagedListQuery;

export type CreateTenantRequest = {
  name: string;
  gcp?: string | null;
};

export type UpdateTenantRequest = {
  name: string;
  gcp?: string | null;
};
