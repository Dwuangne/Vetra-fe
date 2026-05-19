import { Suspense } from "react";

import { RequireAuth } from "@/features/auth";
import { VerificationSessionPage } from "@/features/verification-session";

export default function VerificationSessionsPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm text-muted-foreground">
            Loading…
          </div>
        }
      >
        <VerificationSessionPage />
      </Suspense>
    </RequireAuth>
  );
}
