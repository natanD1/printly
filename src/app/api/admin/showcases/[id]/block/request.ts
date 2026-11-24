import { api } from "@/lib/api";
import type { ShowcaseBlockSchema } from "@/schemas/showcase-block-schema";
import type { AdminShowcase } from "@/types/showcase";

export async function updateAdminShowcaseBlockRequest(
  id: string,
  data: ShowcaseBlockSchema
): Promise<AdminShowcase> {
  const response = await api.patch<AdminShowcase>(
    `/admin/showcases/${id}/block`,
    data
  );

  return response.data;
}
