import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiError, apiFetch } from "@/lib/api-client";
import {
  clearAuthCookies,
  REFRESH_COOKIE_NAME,
  setAuthCookies,
} from "@/lib/auth-cookie";
import { rejectCrossSite } from "@/lib/cross-site";
import type { AuthSession, AuthUser } from "@/types/auth";

export const dynamic = "force-dynamic";

const SERVER_ERROR_STATUS = 500;

export async function POST(request: Request): Promise<NextResponse> {
  const crossSite = rejectCrossSite(request);
  if (crossSite) {
    return crossSite;
  }

  const refreshToken = (await cookies()).get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    const unauthorized = NextResponse.json(
      { message: "Nao autenticado" },
      { status: 401 }
    );
    clearAuthCookies(unauthorized.cookies);

    return unauthorized;
  }

  try {
    const session = await apiFetch<AuthSession>("/auth/refresh", {
      body: { refreshToken },
      method: "POST",
    });

    const response = NextResponse.json<{ user: AuthUser }>({
      user: session.user,
    });
    setAuthCookies(response.cookies, session);

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      const response = NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
      // Só apaga a sessão quando o backend a rejeitou (4xx). Erro 5xx é
      // transitório: manter o refresh cookie permite tentar de novo.
      if (error.status < SERVER_ERROR_STATUS) {
        clearAuthCookies(response.cookies);
      }

      return response;
    }

    throw error;
  }
}
