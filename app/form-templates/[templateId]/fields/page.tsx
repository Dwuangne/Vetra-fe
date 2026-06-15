import { RequireAuth } from "@/features/auth";
import { FormTemplateFieldsPage } from "@/features/form-template";

export default function FormTemplateFieldsRoutePage() {
  return (
    <RequireAuth>
      <FormTemplateFieldsPage />
    </RequireAuth>
  );
}
