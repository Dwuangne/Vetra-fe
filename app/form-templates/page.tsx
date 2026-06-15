import { RequireAuth } from "@/features/auth";
import { FormTemplatePage } from "@/features/form-template";

export default function FormTemplatesPage() {
  return (
    <RequireAuth>
      <FormTemplatePage />
    </RequireAuth>
  );
}
