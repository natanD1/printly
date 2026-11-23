import { api } from "@/lib/api";
import type { Plan, SavePlanPayload } from "@/types/plan";

export async function getPlanRequest(id: string): Promise<Plan> {
  const response = await api.get<Plan>(`/plans/${id}`);

  return response.data;
}

export async function updatePlanRequest(
  id: string,
  data: SavePlanPayload
): Promise<Plan> {
  const response = await api.put<Plan>(`/plans/${id}`, data);

  return response.data;
}

export async function deletePlanRequest(id: string): Promise<void> {
  await api.delete(`/plans/${id}`);
}
