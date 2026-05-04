import { RedirectIfAdminFromHome, RequireAuth } from "@/features/auth";
import { HomePage } from "@/features/home";

export default function Page() {
  return (
    <RequireAuth>
      <RedirectIfAdminFromHome />
      <HomePage />
    </RequireAuth>
  );
}
