import { api } from "@/lib/api";
import type { Showcase } from "@/types/showcase";

export async function getShowcaseRequest(): Promise<Showcase> {
  const response = await api.get<Showcase>("/showcase");

  return response.data;
}

export async function createShowcaseRequest(): Promise<Showcase> {
  const response = await api.post<Showcase>("/showcase");

  return response.data;
}
