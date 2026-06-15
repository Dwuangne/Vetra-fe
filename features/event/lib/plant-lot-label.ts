import type { EventAttributeResult } from "@/lib/api/types/event";

type PlantLotSource = {
  lotNumber: string | null;
  attributes: EventAttributeResult[];
};

export function getPlantLotLabel(row: PlantLotSource): string | null {
  const lot = row.lotNumber?.trim();
  if (lot) return lot;

  const raw = row.attributes.find((attr) => attr.name === "rawLotNumber")?.valString?.trim();
  return raw || null;
}
