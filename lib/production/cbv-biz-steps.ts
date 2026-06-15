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

/** @deprecated Legacy Vetra URI — label only, not selectable in UI. */
export const LEGACY_VETRA_PRODUCTION_BIZ_STEP = "urn:vetra:bizstep:production" as const;

/** @deprecated Legacy Vetra URI — label only, not selectable in UI. */
export const LEGACY_VETRA_MIXING_BIZ_STEP = "urn:vetra:bizstep:mixing" as const;

export type CbvBizStep = (typeof CBV_BIZ_STEPS)[number];

/** Form templates and event ingest — same 10 CBV steps as BE FormTemplateService. */
export const ALL_BIZ_STEPS = CBV_BIZ_STEPS;

/** @deprecated Alias of ALL_BIZ_STEPS — kept for existing imports. */
export const PLANT_BIZ_STEPS = CBV_BIZ_STEPS;

const BIZ_STEP_SUFFIX_BY_URI: Record<CbvBizStep, keyof typeof messages.cbvBizStep> = {
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
};

const LEGACY_BIZ_STEP_SUFFIX: Partial<Record<string, keyof typeof messages.cbvBizStep>> = {
  [LEGACY_VETRA_PRODUCTION_BIZ_STEP]: "production",
  [LEGACY_VETRA_MIXING_BIZ_STEP]: "production",
};

export function getBizStepLabel(uri: string, locale: Locale): string {
  const key =
    BIZ_STEP_SUFFIX_BY_URI[uri as CbvBizStep] ?? LEGACY_BIZ_STEP_SUFFIX[uri];
  if (!key) return uri;
  const row = messages.cbvBizStep[key];
  return row ? pickLocalized(row, locale) : uri;
}
