import { RequireAuth } from "@/features/auth";
import { ProductPage } from "@/features/product";

export default function ProductsPage() {
  return (
    <RequireAuth>
      <ProductPage />
    </RequireAuth>
  );
}
