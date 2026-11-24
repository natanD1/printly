import { api } from "@/lib/api";
import type { ShowcasePublishedSchema } from "@/schemas/showcase-published-schema";
import type { Showcase } from "@/types/showcase";

export async function updateShowcasePublishedRequest(
  data: ShowcasePublishedSchema
): Promise<Showcase> {
  const response = await api.patch<Showcase>("/showcase/published", data);

  return response.data;
}
