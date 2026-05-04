import { Suspense } from "react";

import { RequireAuth } from "@/features/auth";
import { ProductInstancePage } from "@/features/product-instance";

export default function ProductInstancesPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm text-muted-foreground">
            Loading…
          </div>
        }
      >
        <ProductInstancePage />
      </Suspense>
    </RequireAuth>
  );
}
