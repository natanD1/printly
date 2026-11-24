import { env } from "@/lib/env";
import type { ApiErrorResponse } from "@/types/auth";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ApiError";
  }
}

type ApiFetchOptions = Omit<RequestInit, "body" | "cache"> & {
  body?: unknown;
  /**
   * Segundos de cache do `fetch` no servidor (Next). Sem ele a chamada é
   * `no-store`, como todas as rotas autenticadas. Só pra dado público.
   */
  revalidate?: number;
};

/** `no-store` por padrão; com `revalidate`, cache do Next por N segundos. */
function cacheOptions(revalidate?: number): RequestInit {
  return revalidate === undefined
    ? { cache: "no-store" }
    : { next: { revalidate } };
}

export async function apiFetch<T>(
  path: string,
  { body, headers, revalidate, ...init }: ApiFetchOptions = {}
): Promise<T> {
  const isFormData = body instanceof FormData;

  let requestBody: BodyInit | undefined;
  if (body === undefined) {
    requestBody = undefined;
  } else if (isFormData) {
    requestBody = body;
  } else {
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${env.API_URL}${path}`, {
    ...init,
    ...cacheOptions(revalidate),
    body: requestBody,
    headers: isFormData
      ? headers
      : {
          "Content-Type": "application/json",
          ...headers,
        },
  });

  if (!response.ok) {
    const errorBody = (await response
      .json()
      .catch(() => null)) as ApiErrorResponse | null;
    throw new ApiError(
      response.status,
      errorBody?.message ?? "Erro inesperado ao comunicar com a API",
      errorBody?.code
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/** Resposta binária repassada pelos route handlers (fotos/logo). */
export interface ApiBinaryResponse {
  body: ArrayBuffer;
  cacheControl: string | null;
  contentType: string;
}

/** Tipos que as rotas de imagem repassam ao browser (raster; nunca SVG/HTML). */
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

/**
 * GET que devolve bytes (imagem), não JSON. Erro vira `ApiError` igual ao
 * `apiFetch`; o `Content-Type` repassado é sempre o que o backend detectou.
 */
export async function apiFetchBinary(
  path: string,
  { headers, revalidate }: Pick<ApiFetchOptions, "headers" | "revalidate"> = {}
): Promise<ApiBinaryResponse> {
  const response = await fetch(`${env.API_URL}${path}`, {
    ...cacheOptions(revalidate),
    headers,
  });

  if (!response.ok) {
    const errorBody = (await response
      .json()
      .catch(() => null)) as ApiErrorResponse | null;
    throw new ApiError(
      response.status,
      errorBody?.message ?? "Erro inesperado ao comunicar com a API",
      errorBody?.code
    );
  }

  // Defesa em profundidade: o backend já detecta o tipo por magic bytes, mas
  // aqui só passa imagem raster (nunca SVG/HTML, mesmo se o backend mudar).
  const contentType =
    response.headers.get("Content-Type")?.split(";")[0]?.trim().toLowerCase() ??
    "";

  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new ApiError(404, "Imagem não encontrada");
  }

  return {
    body: await response.arrayBuffer(),
    cacheControl: response.headers.get("Cache-Control"),
    contentType,
  };
}
