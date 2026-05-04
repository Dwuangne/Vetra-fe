import { apiGetPublic } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { ApiHttpError } from "../errors";
import type { PublicScanResultDto } from "../types/public-scan";

export async function getPublicScan(gtin: string, serial: string): Promise<PublicScanResultDto> {
  const g = encodeURIComponent(gtin);
  const s = encodeURIComponent(serial);
  const payload = await apiGetPublic<PublicScanResultDto>(`${API_ENDPOINTS.publicScan}/01/${g}/21/${s}`);

  if (payload.data === undefined || payload.data === null) {
    throw new ApiHttpError("Empty response from server", 200);
  }

  return payload.data;
}
