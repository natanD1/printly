import { api } from "@/lib/api";
import type { ManagedUser } from "@/types/plan";

export async function getManagedUsersRequest(): Promise<ManagedUser[]> {
  const response = await api.get<ManagedUser[]>("/users");

  return response.data;
}
