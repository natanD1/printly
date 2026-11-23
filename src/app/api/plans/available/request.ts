import { api } from "@/lib/api";
import type { AvailablePlans } from "@/types/plan";

export async function getAvailablePlansRequest(): Promise<AvailablePlans> {
  const response = await api.get<AvailablePlans>("/plans/available");

  return response.data;
}
