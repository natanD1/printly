import { api } from "@/lib/api";
import type { ShowcaseVisibilitySchema } from "@/schemas/showcase-visibility-schema";
import type { Showcase } from "@/types/showcase";

export async function updateShowcaseItemVisibilityRequest(
  productId: string,
  data: ShowcaseVisibilitySchema
): Promise<Showcase> {
  const response = await api.patch<Showcase>(
    `/showcase/items/${productId}/visibility`,
    data
  );

  return response.data;
}
