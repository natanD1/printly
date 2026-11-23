import { type NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/auth-cookie";

const protectedRoutes = [
  "/home",
  "/estoque",
  "/impressoras",
  "/configuracoes",
  "/convites",
  "/marcas-filamento",
  "/tipos-filamento",
  "/marcas-impressora",
  "/modelos-impressora",
  "/feedbacks",
  "/planos",
  "/assinatura",
  "/usuarios",
  "/onboarding",
];
const publicRoutes = ["/auth"];

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);
  // O access token expira em 15 min; o marcador de sessão dura o mesmo que o refresh.
  const isAuthenticated = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value ||
      request.cookies.get(AUTH_COOKIE_NAME)?.value
  );

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
