import type { PagedListQuery } from "./common";

export type PartyDto = {
  partyId: string;
  tenantId: string;
  gln: string | null;
  name: string;
  taxCode: string | null;
  registeredAddress: string | null;
  phone: string | null;
  email: string | null;
};

export type PartyListQuery = PagedListQuery & {
  tenantId?: string;
};

export type CreatePartyRequest = {
  gln?: string | null;
  name: string;
  taxCode?: string | null;
  registeredAddress?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type UpdatePartyRequest = CreatePartyRequest;
