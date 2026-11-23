import { NextResponse } from "next/server";

/**
 * Bloqueia POSTs de outro site nas rotas de sessão (`/api/auth/*`): sem isso, uma
 * página qualquer poderia forçar login/logout/refresh do usuário (CSRF de sessão).
 * Usa `Sec-Fetch-Site`, enviado pelos browsers atuais; sem o header (browser antigo
 * ou chamada fora do browser) a requisição segue, como antes.
 */
export function rejectCrossSite(request: Request): NextResponse | null {
  const site = request.headers.get("sec-fetch-site");

  if (site === null || site === "same-origin" || site === "none") {
    return null;
  }

  return NextResponse.json(
    { message: "Requisição de origem não permitida" },
    { status: 403 }
  );
}
