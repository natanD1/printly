import { api } from "@/lib/api";
import type { AuthUserResponse } from "@/types/auth";

export async function refreshSessionRequest(): Promise<AuthUserResponse> {
  const response = await api.post<AuthUserResponse>("/auth/refresh");

  return response.data;
}
