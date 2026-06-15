/** Mirrors `CbvDisposition` in Vetra-be.Repository/Enums/EpcisEnums.cs */
export const CBV_DISPOSITIONS = [
  "urn:epcglobal:cbv:disp:active",
  "urn:epcglobal:cbv:disp:inactive",
  "urn:epcglobal:cbv:disp:in_transit",
  "urn:epcglobal:cbv:disp:in_progress",
  "urn:epcglobal:cbv:disp:sold",
  "urn:epcglobal:cbv:disp:recalled",
  "urn:epcglobal:cbv:disp:expired",
  "urn:epcglobal:cbv:disp:damaged",
  "urn:epcglobal:cbv:disp:destroyed",
] as const;

export type CbvDisposition = (typeof CBV_DISPOSITIONS)[number];

const DISPOSITION_SUFFIX_BY_URI: Record<CbvDisposition, string> = {
  "urn:epcglobal:cbv:disp:active": "active",
  "urn:epcglobal:cbv:disp:inactive": "inactive",
  "urn:epcglobal:cbv:disp:in_transit": "in_transit",
  "urn:epcglobal:cbv:disp:in_progress": "in_progress",
  "urn:epcglobal:cbv:disp:sold": "sold",
  "urn:epcglobal:cbv:disp:recalled": "recalled",
  "urn:epcglobal:cbv:disp:expired": "expired",
  "urn:epcglobal:cbv:disp:damaged": "damaged",
  "urn:epcglobal:cbv:disp:destroyed": "destroyed",
};

export function getDispositionShortLabel(uri: string): string {
  const suffix = DISPOSITION_SUFFIX_BY_URI[uri as CbvDisposition];
  if (!suffix) return uri;
  return suffix.replace(/_/g, " ");
}
