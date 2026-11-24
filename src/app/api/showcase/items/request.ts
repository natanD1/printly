import { api } from "@/lib/api";
import type { ShowcaseProductIdsSchema } from "@/schemas/showcase-product-ids-schema";
import type { Showcase } from "@/types/showcase";

export async function addShowcaseItemsRequest(
  data: ShowcaseProductIdsSchema
): Promise<Showcase> {
  const response = await api.post<Showcase>("/showcase/items", data);

  return response.data;
}
