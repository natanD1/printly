import { NextResponse } from "next/server";
import { ApiError, apiFetch } from "@/lib/api-client";
import { setAuthCookies } from "@/lib/auth-cookie";
import { rejectCrossSite } from "@/lib/cross-site";
import { loginSchema } from "@/schemas/login-schema";
import type { AuthSession, AuthUser } from "@/types/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  const crossSite = rejectCrossSite(request);
  if (crossSite) {
    return crossSite;
  }

  const body = await request.json();
  const parsedBody = loginSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { issues: parsedBody.error.issues, message: "Dados inválidos" },
      { status: 400 }
    );
  }

  try {
    const session = await apiFetch<AuthSession>("/auth/login", {
      body: parsedBody.data,
      method: "POST",
    });

    const response = NextResponse.json<{ user: AuthUser }>({
      user: session.user,
    });
    setAuthCookies(response.cookies, session);

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    throw error;
  }
}
