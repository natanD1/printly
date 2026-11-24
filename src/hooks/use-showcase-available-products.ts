"use client";

import axios from "axios";
import useSWR from "swr";
import { getShowcaseAvailableProductsRequest } from "@/app/api/showcase/available-products/request";
import type { ApiErrorResponse } from "@/types/auth";
import type { ShowcaseAvailableProduct } from "@/types/showcase";

const AVAILABLE_PRODUCTS_KEY = "showcase-available-products";

type AvailableProductsKey = readonly [typeof AVAILABLE_PRODUCTS_KEY, string];

/** Casa qualquer cache de produtos disponíveis, de qualquer busca. */
export function isShowcaseAvailableProductsKey(key: unknown): boolean {
  return Array.isArray(key) && key[0] === AVAILABLE_PRODUCTS_KEY;
}

function fetchAvailableProducts([, search]: AvailableProductsKey): Promise<
  ShowcaseAvailableProduct[]
> {
  return getShowcaseAvailableProductsRequest(search);
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  return "Erro inesperado";
}

/** Produtos produzidos que ainda não estão na vitrine. `enabled` falso não busca. */
export function useShowcaseAvailableProducts(search: string, enabled: boolean) {
  const { data, error, isLoading, isValidating } = useSWR<
    ShowcaseAvailableProduct[],
    unknown,
    AvailableProductsKey | null
  >(
    enabled ? [AVAILABLE_PRODUCTS_KEY, search.trim()] : null,
    fetchAvailableProducts,
    { keepPreviousData: true }
  );

  return {
    error: error ? getErrorMessage(error) : null,
    isLoading,
    isValidating,
    products: data ?? [],
  };
}
