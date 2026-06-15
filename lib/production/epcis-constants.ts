/** Mirrors `EpcisEventType` in Vetra-be.Repository/Enums/EpcisEnums.cs */
export const EPCIS_EVENT_TYPES = [
  "ObjectEvent",
  "AggregationEvent",
  "TransactionEvent",
  "TransformationEvent",
] as const;

export type EpcisEventType = (typeof EPCIS_EVENT_TYPES)[number];

/** Mirrors `EpcisAction` in Vetra-be.Repository/Enums/EpcisEnums.cs */
export const EPCIS_ACTIONS = ["ADD", "OBSERVE", "DELETE"] as const;

export type EpcisAction = (typeof EPCIS_ACTIONS)[number];

/** Mirrors `EpcListType` in Vetra-be.Repository/Enums/EpcisEnums.cs */
export const EPC_LIST_TYPES = ["epcList", "childEPCs", "inputEPC", "outputEPC"] as const;

export type EpcListType = (typeof EPC_LIST_TYPES)[number];
