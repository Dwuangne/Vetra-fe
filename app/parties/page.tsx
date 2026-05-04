import { RequireAuth } from "@/features/auth";
import { PartyPage } from "@/features/party";

export default function PartiesPage() {
  return (
    <RequireAuth>
      <PartyPage />
    </RequireAuth>
  );
}
