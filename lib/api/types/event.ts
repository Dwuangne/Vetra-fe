import type { EpcisAction, EpcisEventType, EpcListType } from "@/lib/production/epcis-constants";
import type { PagedListQuery } from "./common";

export type EventEpcResult = {
  instanceId: string;
  epcUri: string;
  epcType: EpcListType | string;
  batchId: string | null;
};

export type EventAttributeResult = {
  attrId: string;
  name: string;
  dataType: string;
  valString: string | null;
  valNumeric: number | null;
  valTimestamp: string | null;
};

export type EventResult = {
  eventId: string;
  tenantId: string;
  clientEventId: string | null;
  eventTime: string;
  eventType: EpcisEventType | string;
  action: EpcisAction | string | null;
  recordTime: string;
  timezoneOffset: string;
  bizStep: string | null;
  disposition: string | null;
  readPointId: string | null;
  bizLocationId: string | null;
  parentInstanceId: string | null;
  transformationId: string | null;
  extensionData: string | null;
  batchId: string | null;
  productionOrderId: string | null;
  epcCount: number;
  epcs: EventEpcResult[];
  attributes: EventAttributeResult[];
};

export type EventEpcListQuery = {
  page?: number;
  size?: number;
};

export type EventTimelineItemResult = {
  eventId: string;
  eventTime: string;
  eventType: EpcisEventType | string;
  action: EpcisAction | string | null;
  bizStep: string | null;
  disposition: string | null;
  readPointId: string | null;
  bizLocationId: string | null;
  batchId: string | null;
  productionOrderId: string | null;
  lotNumber: string | null;
  epcs: EventEpcResult[];
  attributes: EventAttributeResult[];
};

export type EventTimelineQuery = PagedListQuery & {
  epcUri?: string;
  batchId?: string;
  productionOrderId?: string;
  lotKeyword?: string;
  locationId?: string;
  fromTime?: string;
  toTime?: string;
};

export type IngestEventEpcRequest = {
  instanceId: string;
  epcType: EpcListType | string;
};

export type IngestEventAttributeRequest = {
  attrId: string;
  valString?: string | null;
  valNumeric?: number | null;
  valTimestamp?: string | null;
};

export type IngestEventRequest = {
  eventTime: string;
  clientEventId?: string | null;
  eventType: EpcisEventType | string;
  action?: EpcisAction | string | null;
  recordTime?: string | null;
  timezoneOffset: string;
  bizStep?: string | null;
  disposition?: string | null;
  readPointId?: string | null;
  bizLocationId?: string | null;
  parentInstanceId?: string | null;
  transformationId?: string | null;
  extensionData?: string | null;
  batchId?: string | null;
  productionOrderId?: string | null;
  epcs?: IngestEventEpcRequest[];
  attributes?: IngestEventAttributeRequest[];
};
