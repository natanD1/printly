import { api } from "@/lib/api";
import type { MyPlan } from "@/types/plan";

export async function getMyPlanRequest(): Promise<MyPlan> {
  const response = await api.get<MyPlan>("/plans/me");

  return response.data;
}
