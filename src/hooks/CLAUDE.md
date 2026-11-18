# Hooks

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
