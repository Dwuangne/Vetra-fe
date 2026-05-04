import type { PagedListQuery } from "./common";

export type PartyDto = {
  partyId: string;
  tenantId: string;
  gln: string;
  name: string;
};

export type PartyListQuery = PagedListQuery & {
  tenantId?: string;
};

export type CreatePartyRequest = {
  gln: string;
  name: string;
};

export type UpdatePartyRequest = {
  gln: string;
  name: string;
};
