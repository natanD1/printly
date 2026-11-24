import { api } from "@/lib/api";
import type { ShowcaseAvailableProduct } from "@/types/showcase";

export async function getShowcaseAvailableProductsRequest(
  search: string
): Promise<ShowcaseAvailableProduct[]> {
  const response = await api.get<ShowcaseAvailableProduct[]>(
    "/showcase/available-products",
    { params: search ? { search } : undefined }
  );

  return response.data;
}
