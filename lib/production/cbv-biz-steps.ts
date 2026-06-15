import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export const CBV_BIZ_STEPS = [
  "urn:epcglobal:cbv:bizstep:commissioning",
  "urn:epcglobal:cbv:bizstep:decommissioning",
  "urn:epcglobal:cbv:bizstep:packing",
  "urn:epcglobal:cbv:bizstep:unpacking",
  "urn:epcglobal:cbv:bizstep:shipping",
  "urn:epcglobal:cbv:bizstep:receiving",
  "urn:epcglobal:cbv:bizstep:in_transit",
  "urn:epcglobal:cbv:bizstep:inspecting",
  "urn:epcglobal:cbv:bizstep:dispensing",
  "urn:epcglobal:cbv:bizstep:storing",
] as const;

export const VETRA_BIZ_STEPS = ["urn:vetra:bizstep:production"] as const;

/** @deprecated Use urn:vetra:bizstep:production — kept for label fallback on legacy events. */
export const LEGACY_VETRA_MIXING_BIZ_STEP = "urn:vetra:bizstep:mixing" as const;

export type CbvBizStep = (typeof CBV_BIZ_STEPS)[number];
export type VetraBizStep = (typeof VETRA_BIZ_STEPS)[number];

export const ALL_BIZ_STEPS = [...CBV_BIZ_STEPS, ...VETRA_BIZ_STEPS] as const;

/** Biz steps shown in in-plant ingest (excludes logistics / serial commissioning). */
export const PLANT_BIZ_STEPS = [
  "urn:epcglobal:cbv:bizstep:receiving",
  "urn:epcglobal:cbv:bizstep:storing",
  "urn:epcglobal:cbv:bizstep:dispensing",
  "urn:epcglobal:cbv:bizstep:inspecting",
  "urn:vetra:bizstep:production",
] as const;

const BIZ_STEP_SUFFIX_BY_URI: Record<CbvBizStep | VetraBizStep, keyof typeof messages.cbvBizStep> = {
  "urn:epcglobal:cbv:bizstep:commissioning": "commissioning",
  "urn:epcglobal:cbv:bizstep:decommissioning": "decommissioning",
  "urn:epcglobal:cbv:bizstep:packing": "packing",
  "urn:epcglobal:cbv:bizstep:unpacking": "unpacking",
  "urn:epcglobal:cbv:bizstep:shipping": "shipping",
  "urn:epcglobal:cbv:bizstep:receiving": "receiving",
  "urn:epcglobal:cbv:bizstep:in_transit": "in_transit",
  "urn:epcglobal:cbv:bizstep:inspecting": "inspecting",
  "urn:epcglobal:cbv:bizstep:dispensing": "dispensing",
  "urn:epcglobal:cbv:bizstep:storing": "storing",
  "urn:vetra:bizstep:production": "production",
};

export function getBizStepLabel(uri: string, locale: Locale): string {
  const normalized =
    uri === LEGACY_VETRA_MIXING_BIZ_STEP ? "urn:vetra:bizstep:production" : uri;
  const key = BIZ_STEP_SUFFIX_BY_URI[normalized as CbvBizStep | VetraBizStep];
  if (!key) return uri;
  const row = messages.cbvBizStep[key];
  return row ? pickLocalized(row, locale) : uri;
}
