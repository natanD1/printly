import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Reenvio já feito após refresh; evita loop de 401. */
    _retry?: boolean;
    /** Não abre o modal "Sessão expirada" se a sessão não puder ser renovada. */
    skipSessionExpired?: boolean;
  }
}

const API_BASE_URL = "/api";
const REFRESH_LOCK_NAME = "printly-auth-refresh";
const UNAUTHORIZED_STATUS = 401;
const CLIENT_ERROR_MIN_STATUS = 400;
const SERVER_ERROR_MIN_STATUS = 500;

/** Fluxos de autenticação que nunca passam pelo refresh automático. */
const NON_REFRESHABLE_URLS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
];

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Instância sem interceptors: a chamada de refresh não pode cair na lógica de retry.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
});

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

function isRefreshable(
  config: InternalAxiosRequestConfig | undefined
): boolean {
  const url = config?.url ?? "";

  return !NON_REFRESHABLE_URLS.some((path) => url.startsWith(path));
}

async function callRefreshEndpoint(): Promise<void> {
  await refreshClient.post("/auth/refresh");
}

function runRefresh(): Promise<void> {
  // Cookies são compartilhados entre abas e o refresh lê o cookie atual no envio:
  // serializar entre abas evita reuso falso do refresh token rotacionado.
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request<void>(
      REFRESH_LOCK_NAME,
      callRefreshEndpoint
    );
  }

  return callRefreshEndpoint();
}

let refreshPromise: Promise<void> | null = null;

function refreshSession(): Promise<void> {
  refreshPromise ??= runRefresh().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

function isSessionRejected(error: unknown): boolean {
  if (!(axios.isAxiosError(error) && error.response)) {
    return false;
  }

  const { status } = error.response;

  return status >= CLIENT_ERROR_MIN_STATUS && status < SERVER_ERROR_MIN_STATUS;
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const original = (error as AxiosError).config;

    if (
      error.response?.status !== UNAUTHORIZED_STATUS ||
      !original ||
      original._retry ||
      !isRefreshable(original)
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      await refreshSession();
    } catch (refreshError) {
      // Só trata como sessão expirada quando o servidor rejeitou o refresh;
      // falha de rede/5xx é transitória e mantém a sessão.
      if (isSessionRejected(refreshError) && !original.skipSessionExpired) {
        unauthorizedHandler?.();
      }

      return Promise.reject(error);
    }

    return api.request(original);
  }
);
