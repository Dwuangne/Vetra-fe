import { Suspense } from "react";

import { RequireAuth } from "@/features/auth";
import { EventTimelinePage } from "@/features/event";

export default function EventsPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm text-muted-foreground">
            Loading…
          </div>
        }
      >
        <EventTimelinePage />
      </Suspense>
    </RequireAuth>
  );
}
