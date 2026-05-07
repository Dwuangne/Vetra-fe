import { RequireAuth, RequireRole } from "@/features/auth";
import { TenantUserPage } from "@/features/tenant-users";
import { APP_ROLE } from "@/lib/auth/roles";

export default function TenantUsersRoutePage() {
  return (
    <RequireAuth>
      <RequireRole allow={[APP_ROLE.Manager]} loginNext="/tenant-users">
        <TenantUserPage />
      </RequireRole>
    </RequireAuth>
  );
}
