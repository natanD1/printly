"use client";

import axios from "axios";
import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import { removeShowcaseItemRequest } from "@/app/api/showcase/items/[productId]/request";
import { updateShowcaseItemVisibilityRequest } from "@/app/api/showcase/items/[productId]/visibility/request";
import { reorderShowcaseItemsRequest } from "@/app/api/showcase/items/order/request";
import { addShowcaseItemsRequest } from "@/app/api/showcase/items/request";
import { updateShowcasePublishedRequest } from "@/app/api/showcase/published/request";
import {
  createShowcaseRequest,
  getShowcaseRequest,
} from "@/app/api/showcase/request";
import { MY_PLAN_KEY } from "@/hooks/use-my-plan";
import { isShowcaseAvailableProductsKey } from "@/hooks/use-showcase-available-products";
import type { ApiErrorResponse } from "@/types/auth";
import type { Showcase } from "@/types/showcase";

export const SHOWCASE_KEY = "showcase";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  return "Erro inesperado";
}

/**
 * Código de negócio do backend (ex.: `PLAN_LIMIT_REACHED`) num erro lançado
 * pelas mutations (que guardam o erro do axios em `cause`).
 */
export function getShowcaseErrorCode(error: unknown): string | null {
  const source = error instanceof Error ? error.cause : error;

  if (axios.isAxiosError<ApiErrorResponse>(source)) {
    return source.response?.data.code ?? null;
  }

  return null;
}

/** Status HTTP do backend num erro lançado pelas mutations. */
export function getShowcaseErrorStatus(error: unknown): number | null {
  const source = error instanceof Error ? error.cause : error;

  return axios.isAxiosError(source) ? (source.response?.status ?? null) : null;
}

/** `enabled: false` não busca (ex.: usuário sem a regra de vitrine na tabela de produtos). */
export function useShowcase({ enabled = true }: { enabled?: boolean } = {}) {
  const {
    data,
    error,
    isLoading,
    mutate: mutateShowcase,
  } = useSWR<Showcase>(enabled ? SHOWCASE_KEY : null, getShowcaseRequest);
  const { mutate: mutateAll } = useSWRConfig();

  /** Mutation cuja resposta já é a vitrine atualizada: grava no cache sem refazer o GET. */
  const applyShowcase = useCallback(
    async (request: () => Promise<Showcase>) => {
      try {
        const showcase = await request();
        await mutateShowcase(showcase, { revalidate: false });
        await mutateAll(MY_PLAN_KEY);
        await mutateAll(isShowcaseAvailableProductsKey);
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutateAll, mutateShowcase]
  );

  const createShowcase = useCallback(
    () => applyShowcase(createShowcaseRequest),
    [applyShowcase]
  );

  const setPublished = useCallback(
    (isPublished: boolean) =>
      applyShowcase(() => updateShowcasePublishedRequest({ isPublished })),
    [applyShowcase]
  );

  const addItems = useCallback(
    (productIds: string[]) =>
      applyShowcase(() => addShowcaseItemsRequest({ productIds })),
    [applyShowcase]
  );

  const reorderItems = useCallback(
    (productIds: string[]) =>
      applyShowcase(() => reorderShowcaseItemsRequest({ productIds })),
    [applyShowcase]
  );

  const setItemVisibility = useCallback(
    (productId: string, isVisible: boolean) =>
      applyShowcase(() =>
        updateShowcaseItemVisibilityRequest(productId, { isVisible })
      ),
    [applyShowcase]
  );

  // O DELETE devolve 204: revalida pra trazer a vitrine (e o contador) do servidor.
  const removeItem = useCallback(
    async (productId: string) => {
      try {
        await removeShowcaseItemRequest(productId);
        await mutateShowcase();
        await mutateAll(MY_PLAN_KEY);
        await mutateAll(isShowcaseAvailableProductsKey);
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutateAll, mutateShowcase]
  );

  return {
    addItems,
    createShowcase,
    error: error ? getErrorMessage(error) : null,
    fetchShowcase: useCallback(() => mutateShowcase(), [mutateShowcase]),
    isLoading,
    removeItem,
    reorderItems,
    setItemVisibility,
    setPublished,
    showcase: data ?? null,
  };
}
