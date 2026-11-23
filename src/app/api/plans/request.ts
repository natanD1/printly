import { api } from "@/lib/api";
import type { Plan, SavePlanPayload } from "@/types/plan";

export async function getPlansRequest(): Promise<Plan[]> {
  const response = await api.get<Plan[]>("/plans");

  return response.data;
}

export async function createPlanRequest(data: SavePlanPayload): Promise<Plan> {
  const response = await api.post<Plan>("/plans", data);

  return response.data;
}
