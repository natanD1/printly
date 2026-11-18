# API (route handlers + request.ts)

Regras do lado client/server estão no `CLAUDE.md` da raiz (seção **Dupla camada**).

## Padrão de consumo de API (client-side)

A função que chama um endpoint fica **dentro da própria pasta do endpoint**, em `src/app/api/<dominio>/<endpoint>/request.ts`, ao lado do `route.ts` correspondente. Next.js só trata `route.ts`, `page.tsx`, `layout.tsx` etc. como arquivos especiais — qualquer outro nome (como `request.ts`) na mesma pasta não vira rota, só fica colocado junto da lógica que ele chama.

Exemplo já aplicado em `src/app/api/auth/login/`:

```
src/app/api/auth/login/
  route.ts     # server: recebe o POST, valida, chama o backend, seta cookie
  request.ts   # client: função que o front chama pra bater nesse endpoint
```

A chamada usa a instância Axios centralizada em `src/lib/api.ts` (`baseURL: "/api"`) — nunca `axios` direto nem `fetch`:

```ts
// src/app/api/<dominio>/<endpoint>/request.ts
import { api } from "@/lib/api";
import type { AlgumSchema } from "@/schemas/algum-schema";
import type { AlgumaResponse } from "@/types/<dominio>";

export async function algumaRequest(
  credentials: AlgumSchema
): Promise<AlgumaResponse> {
  const response = await api.post<AlgumaResponse>(
    "/<dominio>/<endpoint>",
    credentials
  );

  return response.data;
}
```

Regras:

- Um `request.ts` por endpoint, sempre ao lado do `route.ts` que ele chama.
- Uma função por `request.ts`, nomeada `<acao>Request` (ex: `loginRequest`, `logoutRequest`), tipada com o schema de entrada (`src/schemas`) e o tipo de resposta (`src/types`). Usa `api.get/post/put/delete<TResponse>(...)` e retorna `response.data`.
- `request.ts` só importa `api` de `@/lib/api` — não importar nada server-only (`src/lib/env.ts`, `src/lib/api-client.ts`, `src/lib/auth-cookie.ts`), isso é exclusivo do `route.ts`.
- Erro é tratado com `axios.isAxiosError<ApiErrorResponse>(error)` (ver `src/context/auth-context.tsx`), lendo `error.response?.data.message` — não criar classe de erro própria.
- Hooks e contexts (ex: `src/context/auth-context.tsx`, `src/hooks/use-filaments.ts`) importam essas funções direto de `@/app/api/<dominio>/<endpoint>/request` e só chamam elas; a lógica de estado (loading/error/dados) fica no hook/context, nunca a montagem da chamada HTTP.

### Endpoints autenticados (`route.ts` que chamam o backend real)

Toda rota que exige login no backend segue o mesmo idioma pra repassar o token: lê o cookie httpOnly (`AUTH_COOKIE_NAME`, via `cookies()` de `next/headers`) e manda como `Authorization: Bearer ${token}` no `apiFetch`. Exemplo já aplicado em `src/app/api/auth/logout/route.ts` e replicado em `src/app/api/filaments/`:

```ts
// src/app/api/<dominio>/route.ts
import { cookies } from "next/headers";
import { apiFetch, ApiError } from "@/lib/api-client";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export async function GET(): Promise<NextResponse> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  try {
    const data = await apiFetch<T>("/<dominio>", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
```

CRUD completo (`GET`/`POST` na raiz + `GET`/`PUT`/`DELETE` em `[id]`) fica em duas pastas, exemplo em `src/app/api/filaments/`:

```
src/app/api/filaments/
  route.ts        # GET (lista) e POST (criar)
  request.ts       # getFilamentsRequest, createFilamentRequest
  [id]/
    route.ts       # PUT e DELETE
    request.ts     # updateFilamentRequest, deleteFilamentRequest
```

No Next 16, `params` da rota dinâmica é `Promise` — sempre `const { id } = await params;` (ver `src/app/api/filaments/[id]/route.ts`).

Nem todo recurso tem CRUD completo — `src/app/api/invite-codes/` só tem `GET`/`POST` na raiz e `DELETE` em `[id]` (revogar; não existe `PUT`, convite não é editável). O hook correspondente (`useInviteCodes`) reflete isso: sem `updateInviteCode`.

### Exceção: endpoints `multipart/form-data` (upload de arquivo)

`/products` recebe `IFormFile` (foto) no backend, então o corpo é `multipart/form-data`, não JSON. Duas diferenças em relação ao padrão acima (ver `src/app/api/products/`):

- **`route.ts` não usa `zodSchema.safeParse`** — o corpo é `FormData`, não dá pra validar como JSON antes de repassar. A validação de negócio já acontece no backend (`DomainException` → 400 com `message`, capturado do mesmo jeito pelo `ApiError`). `route.ts` só lê `await request.formData()` e repassa pro `apiFetch`.
- **`apiFetch` (`src/lib/api-client.ts`) detecta `body instanceof FormData`** e não faz `JSON.stringify` nem força `Content-Type: application/json` — deixa o `fetch` setar `multipart/form-data; boundary=...` sozinho. Chamadas JSON existentes não mudam.
- **`request.ts` do client monta o `FormData` manualmente** (`buildProductFormData` em `src/app/api/products/request.ts`), incluindo listas de objeto complexo em chaves indexadas (`Filaments[0].FilamentId`, `Filaments[0].GramsUsed`, ...) — é o único formato que o model binder do ASP.NET aceita em `[FromForm]` pra `List<T>` de objeto. Testado por curl: sem índice, o campo chega vazio no backend sem erro nenhum (não usar Swagger UI pra testar isso, ele não monta esse formato).
