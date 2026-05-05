import type { PagedListQuery } from "./common";

export type CertificateDto = {
  certificateId: string;
  tenantId: string;
  productId: string | null;
  locationId: string | null;
  name: string;
  url: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type CertificateListQuery = PagedListQuery & {
  tenantId?: string;
  productId?: string;
  locationId?: string;
};

export type CreateCertificateRequest = {
  productId?: string | null;
  locationId?: string | null;
  name: string;
  url?: string | null;
};

export type UpdateCertificateRequest = {
  productId?: string | null;
  locationId?: string | null;
  name: string;
  url?: string | null;
};
