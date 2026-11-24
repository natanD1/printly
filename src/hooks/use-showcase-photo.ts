"use client";

import useSWR from "swr";
import { getShowcaseProductPhotoRequest } from "@/app/api/showcase/products/[productId]/photo/request";

/**
 * Miniatura do produto do dono (data URL). Vai pelo axios (não `<img src>`)
 * pra o refresh do access token funcionar; sem foto não busca nada.
 */
export function useShowcasePhoto(productId: string, hasPhoto: boolean) {
  const { data, isLoading } = useSWR<
    string,
    unknown,
    readonly [string, string] | null
  >(
    hasPhoto ? ["showcase-photo", productId] : null,
    ([, id]) => getShowcaseProductPhotoRequest(id),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  return { isLoading, photo: data ?? null };
}
