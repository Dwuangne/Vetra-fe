import type { PagedListQuery } from "./common";

export type LocationDto = {
  locationId: string;
  tenantId: string;
  gln: string | null;
  extension: string;
  partyId: string | null;
  name: string;
  address: string | null;
};

export type LocationListQuery = PagedListQuery & {
  tenantId?: string;
  partyId?: string;
};

export type CreateLocationRequest = {
  gln: string | null;
  extension?: string | null;
  partyId?: string | null;
  name: string;
  address?: string | null;
};

export type UpdateLocationRequest = {
  gln: string | null;
  extension?: string | null;
  partyId?: string | null;
  name: string;
  address?: string | null;
};
