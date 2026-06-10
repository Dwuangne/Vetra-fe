import { Suspense } from "react";

import { RequireAuth } from "@/features/auth";
import { BatchPage } from "@/features/batch";

export default function BatchesPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm text-muted-foreground">
            Loading…
          </div>
        }
      >
        <BatchPage />
      </Suspense>
    </RequireAuth>
  );
}
