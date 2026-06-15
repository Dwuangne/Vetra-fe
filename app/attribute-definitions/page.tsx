import { RequireAuth } from "@/features/auth";
import { AttributeDefinitionPage } from "@/features/attribute-definition";

export default function AttributeDefinitionsPage() {
  return (
    <RequireAuth>
      <AttributeDefinitionPage />
    </RequireAuth>
  );
}
