"use client";

import axios from "axios";
import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import {
  deletePrinterRequest,
  updatePrinterRequest,
} from "@/app/api/printers/[id]/request";
import {
  createPrinterRequest,
  getPrintersRequest,
} from "@/app/api/printers/request";
import { MY_PLAN_KEY } from "@/hooks/use-my-plan";
import { isProductsKey } from "@/hooks/use-products";
import type { PrinterSchema } from "@/schemas/printer-schema";
import type { ApiErrorResponse } from "@/types/auth";
import type { Printer } from "@/types/printer";

const PRINTERS_KEY = "printers";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  return "Erro inesperado";
}

export function usePrinters() {
  const {
    data,
    error,
    isLoading,
    mutate: mutatePrinters,
  } = useSWR<Printer[]>(PRINTERS_KEY, getPrintersRequest);
  const { mutate: mutateAll } = useSWRConfig();

  const createPrinter = useCallback(
    async (formData: PrinterSchema) => {
      try {
        const printer = await createPrinterRequest(formData);
        await mutatePrinters((current) => [...(current ?? []), printer], {
          revalidate: false,
        });
        await mutateAll(MY_PLAN_KEY);
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutateAll, mutatePrinters]
  );

  const updatePrinter = useCallback(
    async (id: string, formData: PrinterSchema) => {
      try {
        const printer = await updatePrinterRequest(id, formData);
        await mutatePrinters(
          (current) =>
            current?.map((item) => (item.id === id ? printer : item)),
          { revalidate: false }
        );
        // Produtos exibem nome e preço sugerido (margem) da impressora.
        await mutateAll(isProductsKey);
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutateAll, mutatePrinters]
  );

  const deletePrinter = useCallback(
    async (id: string) => {
      try {
        await deletePrinterRequest(id);
        await mutatePrinters(
          (current) => current?.filter((item) => item.id !== id),
          { revalidate: false }
        );
        // Produtos que usavam a impressora ficam sem ela (backend faz SetNull).
        await mutateAll(isProductsKey);
        await mutateAll(MY_PLAN_KEY);
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutateAll, mutatePrinters]
  );

  return {
    createPrinter,
    deletePrinter,
    error: error ? getErrorMessage(error) : null,
    fetchPrinters: useCallback(() => mutatePrinters(), [mutatePrinters]),
    isLoading,
    printers: data ?? [],
    updatePrinter,
  };
}
