"use client";

import axios from "axios";
import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import { updateProductProductionRequest } from "@/app/api/products/[id]/production/request";
import {
  deleteProductRequest,
  updateProductRequest,
} from "@/app/api/products/[id]/request";
import {
  createProductRequest,
  getProductsRequest,
} from "@/app/api/products/request";
import type { ProductSchema } from "@/schemas/product-schema";
import type { ApiErrorResponse } from "@/types/auth";
import type { Product } from "@/types/product";
import { type DateRange, toApiParams } from "@/utils/date-filters";

const PRODUCTS_KEY = "products";

type ProductsKey = readonly [typeof PRODUCTS_KEY, string, string];

/** Casa qualquer cache de produtos, de qualquer período. */
export function isProductsKey(key: unknown): boolean {
  return Array.isArray(key) && key[0] === PRODUCTS_KEY;
}

function fetchProducts([, from, to]: ProductsKey): Promise<Product[]> {
  return getProductsRequest({ from, to });
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  return "Erro inesperado";
}

export function useProducts(range: DateRange) {
  const { from, to } = toApiParams(range);
  const { mutate: mutateAll } = useSWRConfig();
  const {
    data,
    error,
    isLoading,
    mutate: mutateProducts,
  } = useSWR<Product[], unknown, ProductsKey>(
    [PRODUCTS_KEY, from, to],
    fetchProducts,
    { keepPreviousData: true }
  );

  const createProduct = useCallback(
    async (formData: ProductSchema) => {
      try {
        await createProductRequest(formData);
        // O produto novo pode ou não cair no período de cada cache: revalida todos.
        await mutateAll(isProductsKey);
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutateAll]
  );

  const replaceProduct = useCallback(
    (product: Product) =>
      mutateAll<Product[]>(
        isProductsKey,
        (current) =>
          current?.map((item) => (item.id === product.id ? product : item)),
        { revalidate: false }
      ),
    [mutateAll]
  );

  const updateProduct = useCallback(
    async (id: string, formData: ProductSchema) => {
      try {
        await replaceProduct(await updateProductRequest(id, formData));
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [replaceProduct]
  );

  /** Marca como produzido (desconta estoque) ou volta pra orçamento (devolve). */
  const setProductProduced = useCallback(
    async (id: string, isProduced: boolean) => {
      try {
        await replaceProduct(
          await updateProductProductionRequest(id, { isProduced })
        );
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [replaceProduct]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        await deleteProductRequest(id);
        await mutateAll<Product[]>(
          isProductsKey,
          (current) => current?.filter((item) => item.id !== id),
          { revalidate: false }
        );
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutateAll]
  );

  return {
    createProduct,
    deleteProduct,
    error: error ? getErrorMessage(error) : null,
    fetchProducts: useCallback(() => mutateProducts(), [mutateProducts]),
    isLoading,
    products: data ?? [],
    setProductProduced,
    updateProduct,
  };
}
