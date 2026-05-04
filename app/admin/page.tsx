import { RequireAdmin, RequireAuth } from "@/features/auth";

/** Placeholder: full admin experience will ship later (per product plan). */
export default function AdminPage() {
  return (
    <RequireAuth>
      <RequireAdmin>
        <main className="p-8">
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="mt-2 text-muted-foreground">Administration area — coming soon.</p>
        </main>
      </RequireAdmin>
    </RequireAuth>
  );
}
