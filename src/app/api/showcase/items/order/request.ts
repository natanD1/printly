import { api } from "@/lib/api";
import type { ShowcaseProductIdsSchema } from "@/schemas/showcase-product-ids-schema";
import type { Showcase } from "@/types/showcase";

export async function reorderShowcaseItemsRequest(
  data: ShowcaseProductIdsSchema
): Promise<Showcase> {
  const response = await api.put<Showcase>("/showcase/items/order", data);

  return response.data;
}
