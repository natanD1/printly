"use client";

import axios from "axios";
import { useCallback } from "react";
import useSWR from "swr";
import { updateAdminShowcaseBlockRequest } from "@/app/api/admin/showcases/[id]/block/request";
import { getAdminShowcasesRequest } from "@/app/api/admin/showcases/request";
import type { ApiErrorResponse } from "@/types/auth";
import type { AdminShowcase } from "@/types/showcase";

const ADMIN_SHOWCASES_KEY = "admin-showcases";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  return "Erro inesperado";
}

/** Só admin. `enabled: false` não busca (o backend recusaria com 403). */
export function useAdminShowcases(enabled: boolean) {
  const {
    data,
    error,
    isLoading,
    mutate: mutateShowcases,
  } = useSWR<AdminShowcase[]>(
    enabled ? ADMIN_SHOWCASES_KEY : null,
    getAdminShowcasesRequest
  );

  const setBlocked = useCallback(
    async (id: string, isBlocked: boolean) => {
      try {
        const showcase = await updateAdminShowcaseBlockRequest(id, {
          isBlocked,
        });
        await mutateShowcases(
          (current) =>
            current?.map((item) => (item.id === id ? showcase : item)),
          { revalidate: false }
        );
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutateShowcases]
  );

  return {
    error: error ? getErrorMessage(error) : null,
    isLoading,
    setBlocked,
    showcases: data ?? [],
  };
}
