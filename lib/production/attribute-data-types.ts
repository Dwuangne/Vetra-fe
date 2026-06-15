import { messages, pickLocalized } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { AttributeDataType } from "@/lib/api/types/attribute-definition";

export const ATTRIBUTE_DATA_TYPES = ["STRING", "NUMERIC", "DATE", "BOOLEAN"] as const satisfies readonly AttributeDataType[];

export function getAttributeDataTypeLabel(dataType: string, locale: Locale): string {
  const row = messages.attributeDataType[dataType as keyof typeof messages.attributeDataType];
  return row ? pickLocalized(row, locale) : dataType;
}
