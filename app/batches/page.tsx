import { RequireAuth } from "@/features/auth";
import { BatchPage } from "@/features/batch";

export default function BatchesPage() {
  return (
    <RequireAuth>
      <BatchPage />
    </RequireAuth>
  );
}
