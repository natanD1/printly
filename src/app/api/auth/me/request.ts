import { api } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

export async function getCurrentUserRequest(): Promise<AuthUser> {
  // Sondagem inicial: sem sessão é esperado, não deve abrir "Sessão expirada".
  const response = await api.get<AuthUser>("/auth/me", {
    skipSessionExpired: true,
  });

  return response.data;
}
