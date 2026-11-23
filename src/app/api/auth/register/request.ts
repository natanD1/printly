import { api } from "@/lib/api";
import type { RegisterSchema } from "@/schemas/register-schema";
import type { AuthUserResponse } from "@/types/auth";

export async function registerRequest(
  credentials: RegisterSchema
): Promise<AuthUserResponse> {
  const response = await api.post<AuthUserResponse>("/auth/register", {
    email: credentials.email,
    inviteCode: credentials.inviteCode,
    name: credentials.name,
    password: credentials.password,
  });

  return response.data;
}
