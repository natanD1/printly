import { api } from "@/lib/api";
import type { AdminShowcase } from "@/types/showcase";

export async function getAdminShowcasesRequest(): Promise<AdminShowcase[]> {
  const response = await api.get<AdminShowcase[]>("/admin/showcases");

  return response.data;
}
