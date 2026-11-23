# Printly

## Convenções

- Nomenclatura de arquivos: **kebab-case** (ex: `login-form.tsx`, `use-auth.ts`, `login-schema.ts`).
- Todo botão (`<button>` ou componente que renderize um) deve ter `cursor-pointer`. Já aplicado no `Button` base (`src/components/ui/button.tsx`); qualquer botão customizado fora dele deve seguir a mesma regra. Motivo: deixa explícito pro usuário quando um elemento é clicável.

## Estrutura

- `src/app` — rotas (App Router). Cada tela fica em sua própria pasta de rota:
  - `src/app/auth` — tela de login/cadastro (pública).
  - `src/app/(app)/home` — tela inicial (protegida, exige login): `HomeOverview` orquestra tudo — guarda o período selecionado (`DateRange`, padrão = mês atual), busca os produtos desse período uma vez (`useProducts(range)`, filtro feito **no backend** via `GET /products?from=&to=` sobre `CreatedAt`), soma os 3 indicadores (`BillingIndicator`, `TotalHourPrintIndicator`, `TotalProductsCount` — todos **seguem o período**, legenda via prop `description`) e repassa os dados/handlers pra `ProductsTable` (que não busca nada sozinha, só recebe props — evita fetch duplicado). CRUD completo de produto: `ProductFormDialog` (criar/editar, com upload de foto e `ProductFilamentPicker`), `ProductDetailDialog` (visualizar, só leitura, mostra breakdown de custo/preço sugerido/preço final), exclusão via `AlertDialog` — tudo isso dentro de `ProductRowActions` (dropdown de ações da tabela). O seletor de período é `ProductsPeriodFilter` (popover com atalhos + 2 `<input type="date">`), limitado a **mês atual + 3 anteriores** (`homeMinDate()` em `src/utils/date-filters.ts`). Esse limite é **só de UX**: o endpoint aceita qualquer período, pra uma futura tela de histórico. Fuso: o front manda instantes ISO UTC (`toApiParams`: início do 1º dia até início do dia seguinte ao último, fim exclusivo), o backend recebe como `DateTimeOffset` e compara com `CreatedAt` (UTC).
  - `src/app/(app)/estoque` — estoque de filamentos (protegida; pasta chama `estoque`, mas componentes/hook internos continuam `filaments-*`/`useFilaments`): mesmo padrão, `FilamentsOverview` + 3 indicadores + grid de cards, CRUD completo via `FilamentFormDialog` e exclusão com `AlertDialog`.
  - `src/app/(app)/impressoras` — impressoras do usuário (protegida): `PrintersOverview` + grid de `PrinterCard` + `PrinterFormDialog`. Cada impressora escolhe **marca → modelo** do catálogo (chips em cascata, só ativos; o já selecionado continua visível na edição) e tem os próprios custos: potência, margem, depreciação (valor + vida útil), manutenção e perda por falha, cada opcional com liga/desliga (`OptionalCost`, `src/components/optional-cost.tsx`). Excluir impressora não apaga produtos (FK `SetNull` no backend): eles mantêm o preço salvo e exigem outra impressora ao editar. `usePrinters` revalida todos os caches de produto após update/delete (nome e preço sugerido vêm da impressora).
  - `src/app/(app)/configuracoes` — perfil + energia (protegida): `SettingsOverview` renderiza `ProfileCard` (nome/e-mail do usuário logado via `useAuth()`, botão "Trocar senha" desabilitado — funcionalidade futura) e `SettingsForm` (só o **preço do kWh**, global do usuário; o resto dos custos fica em cada impressora). Abaixo, `CompanyProfileForm` (identidade da empresa: nome, logo, contatos; `useCompanyProfile`, `GET`/`PUT /company-profile` multipart com `Logo`/`RemoveLogo`). Logo é recurso premium futuro: checar `canUseCompanyLogo()` (`src/utils/can-use-company-logo.ts`, hoje sempre `true`). No PDF de orçamento, sem permissão ou sem logo cadastrado, o cabeçalho usa o logo do Printly (`/printly-logo-horizontal.svg` rasterizado via canvas); o rodapé sempre traz "Gerado com" + logo do Printly.
  - `src/app/onboarding` — pré-cadastro do usuário **recém-cadastrado** (protegida, fora do grupo `(app)`, sem sidebar): `OnboardingWizard` com 4 etapas (empresa só nome → kWh → impressora → filamentos opcional) e `OnboardingPreparing` ("Preparando tudo", mínimo 3s). Cada etapa grava na hora pelos hooks existentes (PUT empresa/kWh; impressora decide POST/PUT pela `printers[0]`) e a etapa inicial sai **só dos dados do servidor** (`use-onboarding.ts`: sem empresa → 1; `settings.updatedAt === null` = kWh não informado → 2; sem impressora → 3; senão 4). Nada em `localStorage`. Conclusão: `POST /auth/onboarding/complete` → `setCurrentUser`. `AuthUser.onboardingCompleted` decide o redirecionamento no login/cadastro e no `OnboardingGate` (`(app)/layout.tsx`, usa `isSessionLoading` pra não piscar o app). Usuários anteriores foram migrados como concluídos. Catálogo de impressora/filamento vazio libera "Pular" só nesse caso. `PrinterForm`/`FilamentForm` aceitam `renderActions` opcional (fora de `Sheet`, já que `SheetClose` quebra sem ele).
  - `src/app/(app)/convites` — gestão de códigos de convite (protegida, **admin-only**): `InviteCodesOverview` + 3 indicadores (gerados/disponíveis/usados) + `DataTable` com status (`Available`/`Used`/`Revoked`/`Expired`, badge colorido), quem usou (nome/e-mail), geração via `InviteCodeFormDialog` (só pede nome do titular — código e prazo de expiração são gerados pelo backend) e revogação via `InviteCodeRowActions` (só aparece pra convites `Available`, com `AlertDialog` de confirmação). Ver seção **Admin-only** abaixo pra regra de acesso.
  - `src/app/(app)/marcas-impressora` e `src/app/(app)/modelos-impressora` — catálogo de impressoras (protegidas, **admin-only** no menu). Marca = nome + ativo (mesmo padrão de `/tipos-filamento`); modelo = nome + marca + imagem base64 + ativo (mesmo padrão de `/marcas-filamento`, multipart). Diferente do catálogo de filamento, o **GET é aberto a qualquer usuário logado** (`[Authorize]` na classe) porque o usuário escolhe marca/modelo ao cadastrar a impressora; só POST/PUT têm `[Authorize(Roles = "Admin")]`.
- **Orçamento (PDF + WhatsApp)**: ações "Gerar orçamento (PDF)" e "Enviar por WhatsApp" em `ProductRowActions`. O PDF (`quote-document.tsx`, `@react-pdf/renderer`) só carrega via `import()` em `generate-quote-pdf.ts` — nunca importar estático (quebra SSR). PDF e mensagem recebem só `QuoteData` (`toQuoteData`, `src/utils/to-quote-data.ts`): **nunca** passar custo, preço sugerido, impressora ou filamentos. Nome/telefone do cliente ficam só no estado do `QuoteWhatsappSheet` (não vão pro backend). "Enviar" **não usa `navigator.share`** (no Mac abria a folha do sistema, não o WhatsApp): baixa o PDF e abre a conversa direto — `whatsapp://` no desktop (app instalado), `wa.me` no celular (`pointer: coarse`), com link pro WhatsApp Web como saída. O PDF é pré-gerado ao abrir o painel pra o clique não ter `await` (Safari perde o gesto).
- `src/components` — componentes React sem subpastas por escopo (ex: `login-form.tsx`, `auth-forms.tsx` direto em `src/components`). `src/components/ui` é exceção, reservada aos componentes do shadcn/ui.
  - Escolha única entre opções vindas da API (marca, modelo, impressora) usa `OptionChips` (`src/components/option-chips.tsx`), não `<select>` nativo — evita o gotcha 2 abaixo e segue o visual do seletor de marca/tipo de filamento.
  - **Sem modal centralizado**: criar/editar/visualizar abre em painel lateral direito (`Sheet` + `SideSheetContent` de `src/components/side-sheet.tsx`; ações do form dentro de `SideSheetActions`, que fica preso no rodapé). `ui/dialog` foi removido de propósito. Exceção: confirmação e aviso de resultado continuam em `AlertDialog` (`ModalCommunication`).
- `src/proxy.ts` — proxy do Next.js (equivalente ao antigo `middleware.ts` a partir do Next 16) que protege rotas: bloqueia `/home` sem cookie de sessão (redireciona pra `/auth`) e bloqueia `/auth` com sessão ativa (redireciona pra `/home`).

## Rotas protegidas

- Rotas autenticadas ficam listadas em `protectedRoutes` dentro de `src/proxy.ts`.
- A verificação é feita pela presença do cookie httpOnly definido em `src/lib/auth-cookie.ts` (`AUTH_COOKIE_NAME`), setado pelas rotas de `src/app/api/auth/login` e `.../register`.
- Novas telas que exigem login: criar a rota em `src/app/<rota>` e adicionar `/<rota>` em `protectedRoutes` no `src/proxy.ts`.

### Admin-only (`isAdmin`)

`AuthUser.isAdmin` (`src/types/auth.ts`) vem do backend (`UserDto.IsAdmin`, propagado pro token JWT como claim de role `Admin`). Não existe checagem de role no `src/proxy.ts` (ele só decide autenticado vs não-autenticado, sem decodificar o JWT no Edge) — a proteção de verdade é **sempre no backend**, via `[Authorize(Roles = "Admin")]` no controller correspondente. No front, a regra é só UX: esconder o que não é pra aparecer.

Padrão no menu (`src/components/app-sidebar.tsx`): itens admin ficam em `adminNavItems`, renderizados num `SidebarGroup` só quando `user?.isAdmin` (via `useAuth()`).

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

## Guias carregados sob demanda

- Padrão `request.ts`/`route.ts`, endpoints autenticados e `multipart`: `src/app/api/CLAUDE.md`.
- Cache SWR e mutations dos hooks: `src/hooks/CLAUDE.md`.
- Fórmula de preço dos produtos: skill `product-pricing` (`.claude/skills/product-pricing/SKILL.md`).

## Preço de produtos (regras fixas)

- `costPrice`/`salePrice` são calculados pelo backend a cada `POST`/`PUT /products`. O front nunca reproduz essa conta.
- Todo produto novo/editado exige `printerId`.
- Horas/gramas do lote: usar `batchHours`/`batchFilament`. Nunca multiplicar `totalHours`/`totalFilament` por `quantity` no front.
- `salePriceOverride` é preço **por unidade**; `0`/vazio vira `null` no submit.
- **Orçamento vs produzido (`isProduced`)**: produto novo nasce orçamento — preço calculado, mas **não desconta estoque** e **não entra nos indicadores** da home (faturamento, horas, produtos fabricados somam só `isProduced`). "Marcar como produzido" no menu de ações (`PATCH /products/{id}/production`, JSON `{ isProduced }`) desconta o filamento (`gramsUsed × printRuns`, erro se faltar); "Voltar para orçamento" devolve. Editar produto produzido troca o consumo antigo pelo novo; editar orçamento não mexe no estoque. Excluir **nunca** devolve filamento. Produtos anteriores à coluna foram migrados como produzidos (já tinham descontado estoque).

## Senha (cadastro vs login)

- Regras de senha forte em `src/utils/password-rules.ts`, espelhadas no backend em `PasswordPolicy` (`Printly.Application`): mín. 8 caracteres, máx. **72 bytes UTF-8** (limite do BCrypt; acento conta 2), maiúscula `\p{Lu}`, minúscula `\p{Ll}`, número `\p{Nd}`, especial `[^\p{L}\p{Nd}]` (espaço conta). Mudou uma regra, muda nos dois lados.
- Valem **só no cadastro** (`registerSchema`/`registerFormSchema` + backend). Login (`loginSchema`, `min(1)`) não valida força: senhas antigas continuam entrando.
- `confirmPassword` só existe no form (`registerFormSchema`); `register-form` → `auth-context` → `request.ts` → `route.ts` montam o body explicitamente com `name`, `email`, `password`, `inviteCode`.
- Campo de senha usa `PasswordInput` (olho, `type="button"`); barra de força `PasswordStrength`.

## Gotchas de formulário (react-hook-form + campos numéricos/nativos)

Três bugs reais já caçados nessa base, pra não repetir:

1. **Campo numérico opcional (`number | null`) com `setValueAs`**: pra um campo nunca tocado pelo usuário, `register(name, { setValueAs })` recebe o `defaultValue` bruto — que pode ser `null`, não `""`. `Number(null)` é `0` em JS, não `NaN`. Sempre tratar os dois: `setValueAs: (v) => (v === "" || v === null ? null : Number(v))` (ver `salePriceOverride` em `src/components/product-form.tsx`).
2. **`<select>` nativo com opções carregadas assíncrono** (ex: lista de filamentos vinda de `useFilaments()`): se o `<select>` monta antes das `<option>`s existirem, o `register(...)` uncontrolled não consegue casar o `defaultValue` com nenhuma opção, e quando elas chegam o browser não corrige sozinho — fica preso no placeholder mesmo com o valor certo salvo no form. Fix: tornar o `<select>` controlado também (`{...register(name)} value={currentValue}`), ver `src/components/product-filament-picker.tsx`.
3. **Datas do backend não são ISO** — vêm formatadas `dd/MM/yyyy HH:mm:ss` (`BrazilianDateTimeConverter` no backend). `new Date(dateString)` do JS assume formato americano (`MM/DD/YYYY`) pra strings não-ISO e falha silenciosamente (ou lê a data errada) pra qualquer dia > 12. Nunca usar `new Date(product.createdAt)` direto — sempre `parseBrazilianDate` (`src/utils/parse-brazilian-date.ts`), usado em `home-overview.tsx` pra filtrar produtos por mês/dia.
