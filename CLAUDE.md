# Printly

## Convenções

- Nomenclatura de arquivos: **kebab-case** (ex: `login-form.tsx`, `use-auth.ts`, `login-schema.ts`).
- Linting/formatação: Biome via Ultracite (`pnpm lint`, `pnpm lint:fix`).
- Gerenciador de pacotes: pnpm.
- Fonte padrão: **Manrope** (`src/app/layout.tsx`, variável `--font-sans`).
- Todo botão (`<button>` ou componente que renderize um) deve ter `cursor-pointer`. Já aplicado no `Button` base (`src/components/ui/button.tsx`); qualquer botão customizado fora dele deve seguir a mesma regra. Motivo: deixa explícito pro usuário quando um elemento é clicável.

## Estrutura

- `src/app` — rotas (App Router). Cada tela fica em sua própria pasta de rota:
  - `src/app/auth` — tela de login/cadastro (pública).
  - `src/app/(app)/home` — tela inicial (protegida, exige login): `HomeOverview` orquestra tudo — guarda o período selecionado (`DateRange`, padrão = mês atual), busca os produtos desse período uma vez (`useProducts(range)`, filtro feito **no backend** via `GET /products?from=&to=` sobre `CreatedAt`), soma os 3 indicadores (`BillingIndicator`, `TotalHourPrintIndicator`, `TotalProductsCount` — todos **seguem o período**, legenda via prop `description`) e repassa os dados/handlers pra `ProductsTable` (que não busca nada sozinha, só recebe props — evita fetch duplicado). CRUD completo de produto: `ProductFormDialog` (criar/editar, com upload de foto e `ProductFilamentPicker`), `ProductDetailDialog` (visualizar, só leitura, mostra breakdown de custo/preço sugerido/preço final), exclusão via `AlertDialog` — tudo isso dentro de `ProductRowActions` (dropdown de ações da tabela). O seletor de período é `ProductsPeriodFilter` (popover com atalhos + 2 `<input type="date">`), limitado a **mês atual + 3 anteriores** (`homeMinDate()` em `src/utils/date-filters.ts`). Esse limite é **só de UX**: o endpoint aceita qualquer período, pra uma futura tela de histórico. Fuso: o front manda instantes ISO UTC (`toApiParams`: início do 1º dia até início do dia seguinte ao último, fim exclusivo), o backend recebe como `DateTimeOffset` e compara com `CreatedAt` (UTC).
  - `src/app/(app)/estoque` — estoque de filamentos (protegida; pasta chama `estoque`, mas componentes/hook internos continuam `filaments-*`/`useFilaments`): mesmo padrão, `FilamentsOverview` + 3 indicadores + grid de cards, CRUD completo via `FilamentFormDialog` e exclusão com `AlertDialog`.
  - `src/app/(app)/impressoras` — impressoras do usuário (protegida): `PrintersOverview` + grid de `PrinterCard` + `PrinterFormDialog`. Cada impressora escolhe **marca → modelo** do catálogo (chips em cascata, só ativos; o já selecionado continua visível na edição) e tem os próprios custos: potência, margem, depreciação (valor + vida útil), manutenção e perda por falha, cada opcional com liga/desliga (`OptionalCost`, `src/components/optional-cost.tsx`). Excluir impressora não apaga produtos (FK `SetNull` no backend): eles mantêm o preço salvo e exigem outra impressora ao editar. `usePrinters` revalida todos os caches de produto após update/delete (nome e preço sugerido vêm da impressora).
  - `src/app/(app)/configuracoes` — perfil + energia (protegida): `SettingsOverview` renderiza `ProfileCard` (nome/e-mail do usuário logado via `useAuth()`, botão "Trocar senha" desabilitado — funcionalidade futura) e `SettingsForm` (só o **preço do kWh**, global do usuário; o resto dos custos fica em cada impressora).
  - `src/app/(app)/convites` — gestão de códigos de convite (protegida, **admin-only**): `InviteCodesOverview` + 3 indicadores (gerados/disponíveis/usados) + `DataTable` com status (`Available`/`Used`/`Revoked`/`Expired`, badge colorido), quem usou (nome/e-mail), geração via `InviteCodeFormDialog` (só pede nome do titular — código e prazo de expiração são gerados pelo backend) e revogação via `InviteCodeRowActions` (só aparece pra convites `Available`, com `AlertDialog` de confirmação). Ver seção **Admin-only** abaixo pra regra de acesso.
  - `src/app/(app)/marcas-impressora` e `src/app/(app)/modelos-impressora` — catálogo de impressoras (protegidas, **admin-only** no menu). Marca = nome + ativo (mesmo padrão de `/tipos-filamento`); modelo = nome + marca + imagem base64 + ativo (mesmo padrão de `/marcas-filamento`, multipart). Diferente do catálogo de filamento, o **GET é aberto a qualquer usuário logado** (`[Authorize]` na classe) porque o usuário escolhe marca/modelo ao cadastrar a impressora; só POST/PUT têm `[Authorize(Roles = "Admin")]`.
  - `src/app/page.tsx` — raiz `/`, apenas redireciona para `/auth`.
  - `src/app/api` — endpoints de API (route handlers). Obrigatoriamente dentro de `app/`, é exigência do Next.js — não pode ficar fora dele.
- `src/components` — componentes React sem subpastas por escopo (ex: `login-form.tsx`, `auth-card.tsx` direto em `src/components`). `src/components/ui` é exceção, reservada aos componentes do shadcn/ui.
  - Escolha única entre opções vindas da API (marca, modelo, impressora) usa `OptionChips` (`src/components/option-chips.tsx`), não `<select>` nativo — evita o gotcha 2 abaixo e segue o visual do seletor de marca/tipo de filamento.
- `src/schemas` — validações de formulário com Zod (`*-schema.ts`).
- `src/hooks` — hooks customizados (ex: `use-auth.ts`).
- `src/context` — contextos React (ex: `auth-context.tsx`, fonte da lógica de login/logout/register).
- `src/lib` — utilitários, clientes HTTP e validação de env (`src/lib/env.ts`).
- `src/types` — tipos compartilhados.
- `src/proxy.ts` — proxy do Next.js (equivalente ao antigo `middleware.ts` a partir do Next 16) que protege rotas: bloqueia `/home` sem cookie de sessão (redireciona pra `/auth`) e bloqueia `/auth` com sessão ativa (redireciona pra `/home`).

## Rotas protegidas

- Rotas autenticadas ficam listadas em `protectedRoutes` dentro de `src/proxy.ts`.
- A verificação é feita pela presença do cookie httpOnly definido em `src/lib/auth-cookie.ts` (`AUTH_COOKIE_NAME`), setado pelas rotas de `src/app/api/auth/login` e `.../register`.
- Novas telas que exigem login: criar a rota em `src/app/<rota>` e adicionar `/<rota>` em `protectedRoutes` no `src/proxy.ts`.

### Admin-only (`isAdmin`)

`AuthUser.isAdmin` (`src/types/auth.ts`) vem do backend (`UserDto.IsAdmin`, propagado pro token JWT como claim de role `Admin`). Não existe checagem de role no `src/proxy.ts` (ele só decide autenticado vs não-autenticado, sem decodificar o JWT no Edge) — a proteção de verdade é **sempre no backend**, via `[Authorize(Roles = "Admin")]` no controller correspondente. No front, a regra é só UX: esconder o que não é pra aparecer.

Padrão usado em `/convites` (`src/components/app-sidebar.tsx`): pegar `user` de `useAuth()` e incluir o item de menu condicionalmente:

```ts
const navItems = useMemo(
  () =>
    user?.isAdmin
      ? [...baseNavItems, { icon: Ticket, title: "Convites", url: "/convites" }]
      : baseNavItems,
  [user?.isAdmin]
);
```

Se um usuário não-admin acessar a rota direto pela URL, a tela renderiza normalmente mas a chamada à API volta 403 (backend rejeitando) — a UI mostra a mensagem de erro do hook, não precisa de tratamento especial.

## Dupla camada: client (browser) vs server (route.ts)

O projeto tem dois lados separados de propósito, cada um com seu próprio cliente HTTP e sua própria variável de ambiente:

```
Browser --(/api/auth/login)--> Next.js route.ts --(API_URL)--> Backend real
   ^                                  |
   |___________ cookie httpOnly ______|
```

- **Client (browser)** — `src/lib/api.ts` (`baseURL: "/api"`). O browser só fala com o próprio Next.js, nunca com o backend real. Usado pelos `request.ts`.
- **Server (`route.ts`)** — `src/lib/api-client.ts` (`apiFetch`), com `baseURL` vindo de `env.API_URL` (`src/lib/env.ts`, lido do `.env.development`). Só o `route.ts` fala com o backend real.

Por que não simplificar em uma camada só (browser chamando `API_URL` direto):

- `env.ts` valida `process.env` no server. `API_URL` sem prefixo `NEXT_PUBLIC_` não existe no bundle do browser — viraria `undefined` se usado em `src/lib/api.ts`.
- O token que o backend devolve no login vira cookie **httpOnly** dentro do `route.ts` — o browser nunca tem acesso a esse token via JS, só o navegador manda o cookie automaticamente. Se o browser chamasse o backend direto, o token precisaria ficar exposto no client (menos seguro) e o backend precisaria de CORS liberado pro navegador.

Regra: `API_URL` só pode ser usado dentro de `route.ts` (via `api-client.ts`). `src/lib/api.ts` nunca aponta pro backend real, só pra `/api`.

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
// src/lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});
```

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

## Cache client-side com SWR (stale-while-revalidate)

Todo hook de leitura de lista (`useFilaments`, `useProducts`, `useInviteCodes`) usa **SWR** (`swr`, não `useEffect`+`useState` manual) — decisão pra parar de refazer fetch toda vez que o usuário troca de rota, já que o cache é compartilhado por key entre qualquer componente que chame o mesmo hook.

- **Provider global**: `src/components/providers.tsx` (`"use client"`, consolida `ThemeProvider` + `SWRConfig` + `AuthProvider`, montado em `src/app/layout.tsx`). Config: `dedupingInterval: 5000` (evita refetch duplicado se o usuário voltar pra mesma rota em menos de 5s), `revalidateOnFocus`/`revalidateOnReconnect: true` (mantém dado atualizado sem ação do usuário).
- **Key**: string fixa por recurso (`"filaments"`, `"invite-codes"`), definida como constante no topo do hook. Exceção: produtos usam key composta `["products", from, to]` (período, ver `useProducts(range)`); o fetcher recebe a tupla e chama `getProductsRequest({ from, to })`. `keepPreviousData: true` evita piscar skeleton ao trocar o período.
- **Fetcher**: a própria função `request.ts` do endpoint (ex: `getFilamentsRequest`), passada direto pro `useSWR(key, fetcher)`.
- **Mutations (create/update/delete)**: chamam a função de `request.ts` e depois `mutate` (retornado por `useSWR`, renomeado tipo `mutateFilaments` pra não colidir entre hooks) pra atualizar o cache **na hora**, sem esperar revalidação:
  ```ts
  const createFilament = useCallback(async (formData: FilamentSchema) => {
    try {
      const filament = await createFilamentRequest(formData);
      await mutateFilaments((current) => [filament, ...(current ?? [])], {
        revalidate: false,
      });
    } catch (caughtError) {
      throw new Error(getErrorMessage(caughtError), { cause: caughtError });
    }
  }, [mutateFilaments]);
  ```
  `revalidate: false` porque a resposta do `POST`/`PUT` já é a entidade atualizada — não precisa refazer o `GET`. Exceção: revogação de convite (`useInviteCodes.revokeInviteCode`) usa `revalidate: true`, porque o `DELETE` não devolve a entidade atualizada, só sucesso — o front atualiza o campo que sabe (`status`) otimisticamente e deixa a revalidação trazer o resto (`revokedAt` etc.) do servidor.

  Produtos têm um cache por período, então as mutations de `useProducts` usam `useSWRConfig().mutate(isProductsKey, ...)` pra atingir **todos** os caches de produto: update faz `map` e delete faz `filter` (ambos `revalidate: false`); create só revalida todos (`mutate(isProductsKey)`), porque o produto novo pode ou não cair no período de cada cache.
- **Erro**: todo erro (do fetch inicial ou das mutations) passa por `getErrorMessage` (helper duplicado em cada hook, não extraído — três linhas, não vale a abstração) que usa `axios.isAxiosError<ApiErrorResponse>` pra ler `error.response?.data.message`. Mutations relançam como `new Error(message, { cause: caughtError })`, não o erro do axios cru — os componentes chamadores só fazem `try/finally` (nunca inspecionam o tipo do erro), então isso é seguro.
- **Refresh manual**: hooks expõem `fetchXxx: () => mutate()` (sem args = força revalidação), usado pelo botão "Atualizar" das telas.
- Ao criar um hook de leitura novo, copiar `src/hooks/use-filaments.ts` como template — é o mais simples dos três.

## Cálculo automático de preço (produtos)

`Product.costPrice`/`salePrice` **não são digitados** — o backend calcula sozinho a cada `POST`/`PUT /products` (`ProductPricingCalculator`, `Printly.Application`). Todo produto novo/editado exige uma **impressora** (`printerId`, backend responde 400 "Selecione uma impressora." sem ela): potência, depreciação, manutenção, falha e margem vêm dela (`Printer`); só o `kwhPrice` vem de `UserSettings`. Produtos anteriores ao módulo têm `printerId = null` e mantêm o preço salvo até serem editados. Gramas e horas do produto são **por impressão** (mesa), exatamente como o fatiador mostra; `piecesPerPrint` (peças por mesa, padrão 1) e `quantity` (total de peças, padrão 1) definem quantas impressões o lote exige, de forma **proporcional** (sem arredondar mesa parcial: 12 peças com 5 por mesa = 2,4 impressões). O fator fica em `Product.PrintRuns` (backend):

```
printRuns     = quantity / piecesPerPrint
material      = Σ (gramsUsed × printRuns / 1000) × filament.filamentPrice
energia       = (averagePowerWatts / 1000) × totalHours × printRuns × kwhPrice
depreciação   = depreciationEnabled ? printerValue / printerLifespanHours × totalHours × printRuns : 0
manutenção    = maintenanceEnabled (e depreciação ligada) ? depreciação × maintenancePercentage / 100 : 0
falha         = failureEnabled ? (material + energia + depreciação + manutenção) × failureRatePercentage / 100 : 0
costPrice     = material + energia + depreciação + manutenção + falha        (custo real do lote)
suggestedSalePrice = costPrice × (1 + defaultProfitMarginPercentage / 100)   (lote)
salePrice     = salePriceOverride × qtd (se enviado) senão suggestedSalePrice  (lote)
unitSalePrice = salePrice / qtd
```

Na fórmula acima, `averagePowerWatts`, `printerValue`, `printerLifespanHours`, `maintenancePercentage`, `failureRatePercentage`, `defaultProfitMarginPercentage` e os toggles são **da impressora do produto** (tela `/impressoras`); `kwhPrice` é de `UserSettings` (tela `/configuracoes`). Depreciação, manutenção e perda por falha são **opcionais, cada uma com liga/desliga por impressora** (`depreciationEnabled`, `maintenanceEnabled`, `failureEnabled`, desligados por padrão). Mão de obra ainda não existe. O front nunca reproduz essa conta — só manda `printerId`, `totalHours`, `piecesPerPrint`, `quantity`, os filamentos usados (`filamentId` + `gramsUsed`, por impressão) e, opcionalmente, `salePriceOverride` (**preço por unidade**; `0`/vazio vira `null` no submit pra usar o sugerido). `ProductDto`/`Product` (`src/types/product.ts`) trazem `costPrice`, `salePrice` (total do lote, usado no faturamento da home), `unitSalePrice`, `suggestedSalePrice` (sempre recalculado com a margem *atual* da impressora; sem impressora = `salePrice` salvo), `printerId`/`printerName` e os totais do lote já calculados — `batchHours` (`totalHours × printRuns`) e `batchFilament` (`totalFilament × printRuns`). Use esses dois pra exibir/somar horas e gramas do lote; nunca multiplique `totalHours`/`totalFilament` por `quantity` no front. O estoque de filamento é descontado em `gramsUsed × printRuns`. Produtos criados antes desse campo têm `piecesPerPrint = 1` (default da coluna), então o custo deles não mudou.

## Gotchas de formulário (react-hook-form + campos numéricos/nativos)

Três bugs reais já caçados nessa base, pra não repetir:

1. **Campo numérico opcional (`number | null`) com `setValueAs`**: pra um campo nunca tocado pelo usuário, `register(name, { setValueAs })` recebe o `defaultValue` bruto — que pode ser `null`, não `""`. `Number(null)` é `0` em JS, não `NaN`. Sempre tratar os dois: `setValueAs: (v) => (v === "" || v === null ? null : Number(v))` (ver `salePriceOverride` em `src/components/product-form.tsx`).
2. **`<select>` nativo com opções carregadas assíncrono** (ex: lista de filamentos vinda de `useFilaments()`): se o `<select>` monta antes das `<option>`s existirem, o `register(...)` uncontrolled não consegue casar o `defaultValue` com nenhuma opção, e quando elas chegam o browser não corrige sozinho — fica preso no placeholder mesmo com o valor certo salvo no form. Fix: tornar o `<select>` controlado também (`{...register(name)} value={currentValue}`), ver `src/components/product-filament-picker.tsx`.
3. **Datas do backend não são ISO** — vêm formatadas `dd/MM/yyyy HH:mm:ss` (`BrazilianDateTimeConverter` no backend). `new Date(dateString)` do JS assume formato americano (`MM/DD/YYYY`) pra strings não-ISO e falha silenciosamente (ou lê a data errada) pra qualquer dia > 12. Nunca usar `new Date(product.createdAt)` direto — sempre `parseBrazilianDate` (`src/utils/parse-brazilian-date.ts`), usado em `home-overview.tsx` pra filtrar produtos por mês/dia.
