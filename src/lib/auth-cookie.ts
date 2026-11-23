import type { NextResponse } from "next/server";
import type { AuthSession } from "@/types/auth";

/** Access token (JWT curto). Mantém o nome histórico: as rotas autenticadas leem este cookie. */
export const AUTH_COOKIE_NAME = "printly_token";
/** Refresh token opaco. Só trafega em `/api/auth`, nunca em navegação de página. */
export const REFRESH_COOKIE_NAME = "printly_refresh";
/** Marcador sem segredo: o `proxy.ts` só precisa saber que existe sessão. */
export const SESSION_COOKIE_NAME = "printly_session";

const ACCESS_COOKIE_PATH = "/";
const REFRESH_COOKIE_PATH = "/api/auth";
const SESSION_COOKIE_PATH = "/";

type ResponseCookies = NextResponse["cookies"];

export function setAuthCookies(
  cookies: ResponseCookies,
  session: AuthSession
): void {
  const secure = process.env.NODE_ENV === "production";

  cookies.set(AUTH_COOKIE_NAME, session.accessToken, {
    httpOnly: true,
    maxAge: session.accessTokenExpiresIn,
    path: ACCESS_COOKIE_PATH,
    sameSite: "lax",
    secure,
  });
  cookies.set(REFRESH_COOKIE_NAME, session.refreshToken, {
    httpOnly: true,
    maxAge: session.refreshTokenExpiresIn,
    path: REFRESH_COOKIE_PATH,
    sameSite: "strict",
    secure,
  });
  cookies.set(SESSION_COOKIE_NAME, "1", {
    httpOnly: true,
    maxAge: session.refreshTokenExpiresIn,
    path: SESSION_COOKIE_PATH,
    sameSite: "lax",
    secure,
  });
}

export function clearAuthCookies(cookies: ResponseCookies): void {
  cookies.delete({ name: AUTH_COOKIE_NAME, path: ACCESS_COOKIE_PATH });
  cookies.delete({ name: REFRESH_COOKIE_NAME, path: REFRESH_COOKIE_PATH });
  cookies.delete({ name: SESSION_COOKIE_NAME, path: SESSION_COOKIE_PATH });
}
