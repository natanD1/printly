import { api } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

export async function completeOnboardingRequest(): Promise<AuthUser> {
  const response = await api.post<AuthUser>("/auth/onboarding/complete");

  return response.data;
}
