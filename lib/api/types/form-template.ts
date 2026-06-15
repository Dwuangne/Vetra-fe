import type { AttributeDataType } from "./attribute-definition";
import type { PagedListQuery } from "./common";

export type FormFieldDto = {
  attrId: string;
  attributeName: string;
  dataType: AttributeDataType;
  isRequired: boolean;
};

export type FormTemplateDto = {
  templateId: string;
  tenantId: string;
  name: string;
  bizStep: string;
  fields: FormFieldDto[];
};

export type FormTemplateListQuery = PagedListQuery & {
  bizStep?: string;
};

export type CreateFormTemplateRequest = {
  name: string;
  bizStep: string;
};

export type UpdateFormTemplateRequest = {
  name: string;
  bizStep: string;
};

export type UpsertFormFieldRequest = {
  attrId: string;
  isRequired: boolean;
};
