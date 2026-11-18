import { api } from "@/lib/api";
import type { ProductProductionSchema } from "@/schemas/product-production-schema";
import type { Product } from "@/types/product";

export async function updateProductProductionRequest(
  id: string,
  data: ProductProductionSchema
): Promise<Product> {
  const response = await api.patch<Product>(`/products/${id}/production`, data);

  return response.data;
}
