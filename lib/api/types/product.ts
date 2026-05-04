import type { PagedListQuery } from "./common";

export type ProductDto = {
  productId: string;
  tenantId: string;
  gtin: string;
  name: string;
  imageUrl: string;
  description: string | null;
};

export type ProductListQuery = PagedListQuery & {
  tenantId?: string;
};

export type CreateProductRequest = {
  gtin: string;
  name: string;
  imageUrl: string;
  description?: string | null;
};

export type UpdateProductRequest = {
  gtin: string;
  name: string;
  imageUrl: string;
  description?: string | null;
};
