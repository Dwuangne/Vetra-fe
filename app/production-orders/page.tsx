import { RequireAuth } from "@/features/auth";
import { ProductionOrderPage } from "@/features/production-order";

export default function ProductionOrdersPage() {
  return (
    <RequireAuth>
      <ProductionOrderPage />
    </RequireAuth>
  );
}
