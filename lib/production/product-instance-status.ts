import type { ProductInstanceStatus } from "@/lib/api/types/product-instance";

const INSTANCE_STATUS_ORDER: readonly ProductInstanceStatus[] = [0, 1, 2];

export function normalizeProductInstanceStatus(
  status: ProductInstanceStatus | number
): ProductInstanceStatus {
  if (INSTANCE_STATUS_ORDER.includes(status as ProductInstanceStatus)) {
    return status as ProductInstanceStatus;
  }
  return 0;
}
