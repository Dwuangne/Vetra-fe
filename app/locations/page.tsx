import { RequireAuth } from "@/features/auth";
import { LocationPage } from "@/features/location";

export default function LocationsPage() {
  return (
    <RequireAuth>
      <LocationPage />
    </RequireAuth>
  );
}
