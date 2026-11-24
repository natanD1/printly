import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api-client";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

/** Cabeçalho `Authorization` com o access token do cookie httpOnly. */
export async function getAuthHeaders(): Promise<{ Authorization: string }> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  return { Authorization: `Bearer ${token}` };
}

/** Repassa `{ message, code }` do backend; erro que não é `ApiError` sobe. */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { code: error.code, message: error.message },
      { status: error.status }
    );
  }

  throw error;
}

export function invalidDataResponse(issues: unknown): NextResponse {
  return NextResponse.json(
    { issues, message: "Dados inválidos" },
    { status: 400 }
  );
}

export function notFoundResponse(): NextResponse {
  return NextResponse.json({ message: "Não encontrado" }, { status: 404 });
}
