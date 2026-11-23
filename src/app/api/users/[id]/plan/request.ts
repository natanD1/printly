import { api } from "@/lib/api";
import type { ManagedUser } from "@/types/plan";

export async function changeUserPlanRequest(
  userId: string,
  planId: string
): Promise<ManagedUser> {
  const response = await api.patch<ManagedUser>(`/users/${userId}/plan`, {
    planId,
  });

  return response.data;
}
