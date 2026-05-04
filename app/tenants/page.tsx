import { RequireAdmin, RequireAuth } from "@/features/auth";
import { TenantPage } from "@/features/tenant";

export default function TenantsPage() {
  return (
    <RequireAuth>
      <RequireAdmin>
        <TenantPage />
      </RequireAdmin>
    </RequireAuth>
  );
}
