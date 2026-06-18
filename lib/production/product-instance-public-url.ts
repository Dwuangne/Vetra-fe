import type { BatchStatus } from "@/lib/api/types/batch";
import type { ProductionOrderStatus } from "@/lib/api/types/production-order";

/** Mirrors public-scan gate for UI (instance rows already exist). */
export type ProductInstancePublicUrlState = "active" | "notice" | "hidden";

export function resolveProductInstancePublicUrlState(
  batchStatus: BatchStatus,
  productionOrderStatus: ProductionOrderStatus | null
): ProductInstancePublicUrlState {
  if (batchStatus === "Quarantined" || batchStatus === "Recalled" || batchStatus === "Destroyed") {
    return "notice";
  }
  if (batchStatus === "Planned" || batchStatus === "InProduction") {
    return "hidden";
  }
  if (batchStatus !== "Released") {
    return "hidden";
  }
  if (productionOrderStatus === null) {
    return "hidden";
  }
  if (productionOrderStatus === "Draft" || productionOrderStatus === "Cancelled") {
    return "hidden";
  }
  if (
    productionOrderStatus === "Confirmed" ||
    productionOrderStatus === "InProduction" ||
    productionOrderStatus === "Completed"
  ) {
    return "active";
  }
  return "hidden";
}

export function buildPublicGs1ScanPath(gtin: string, serial: string): string {
  const g = gtin.trim();
  const encSerial = encodeURIComponent(serial);
  return `/01/${g}/21/${encSerial}`;
}

export function buildPublicGs1ScanUrl(baseUrl: string, gtin: string, serial: string): string {
  const path = buildPublicGs1ScanPath(gtin, serial);
  const base = baseUrl.replace(/\/+$/, "");
  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
