"use client";

import { AppShellLayout } from "./app-shell-layout";

export function HomePage() {
  return (
    <AppShellLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="h-8 w-full rounded-md bg-muted/50" />
            <div className="mt-2 space-y-2">
              <div className="h-4 w-3/4 rounded-md bg-muted/50" />
              <div className="h-4 w-1/2 rounded-md bg-muted/50" />
            </div>
          </div>
        ))}
      </div>
    </AppShellLayout>
  );
}
