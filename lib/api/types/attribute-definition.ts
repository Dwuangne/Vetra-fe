import type { PagedListQuery } from "./common";

export type AttributeDataType = "STRING" | "NUMERIC" | "DATE" | "BOOLEAN";

export type AttributeDefinitionDto = {
  attrId: string;
  tenantId: string;
  name: string;
  dataType: AttributeDataType;
};

export type AttributeDefinitionListQuery = PagedListQuery & {
  dataType?: AttributeDataType;
};

export type CreateAttributeDefinitionRequest = {
  name: string;
  dataType: AttributeDataType;
};

export type UpdateAttributeDefinitionRequest = {
  name: string;
  dataType: AttributeDataType;
};
