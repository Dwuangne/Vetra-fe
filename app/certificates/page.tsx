import { RequireAuth } from "@/features/auth";
import { CertificatePage } from "@/features/certificate";

export default function CertificatesPage() {
  return (
    <RequireAuth>
      <CertificatePage />
    </RequireAuth>
  );
}
