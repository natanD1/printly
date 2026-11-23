import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api-client";
import { clearAuthCookies, REFRESH_COOKIE_NAME } from "@/lib/auth-cookie";
import { rejectCrossSite } from "@/lib/cross-site";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  const crossSite = rejectCrossSite(request);
  if (crossSite) {
    return crossSite;
  }

  const refreshToken = (await cookies()).get(REFRESH_COOKIE_NAME)?.value;

  if (refreshToken) {
    await apiFetch<void>("/auth/logout", {
      body: { refreshToken },
      method: "POST",
    }).catch(() => null);
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response.cookies);

  return response;
}
