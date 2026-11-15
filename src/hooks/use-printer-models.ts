"use client";

import axios from "axios";
import { useCallback } from "react";
import useSWR from "swr";
import { updatePrinterModelRequest } from "@/app/api/printer-models/[id]/request";
import {
  createPrinterModelRequest,
  getPrinterModelsRequest,
} from "@/app/api/printer-models/request";
import type { PrinterModelSchema } from "@/schemas/printer-model-schema";
import type { ApiErrorResponse } from "@/types/auth";
import type { PrinterModel } from "@/types/printer-model";

const PRINTER_MODELS_KEY = "printer-models";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  return "Erro inesperado";
}

export function usePrinterModels() {
  const {
    data,
    error,
    isLoading,
    mutate: mutatePrinterModels,
  } = useSWR<PrinterModel[]>(PRINTER_MODELS_KEY, getPrinterModelsRequest);

  const createPrinterModel = useCallback(
    async (formData: PrinterModelSchema) => {
      try {
        const printerModel = await createPrinterModelRequest(formData);
        await mutatePrinterModels(
          (current) => [printerModel, ...(current ?? [])],
          { revalidate: false }
        );
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutatePrinterModels]
  );

  const updatePrinterModel = useCallback(
    async (id: string, formData: PrinterModelSchema, isActive: boolean) => {
      try {
        const printerModel = await updatePrinterModelRequest(
          id,
          formData,
          isActive
        );
        await mutatePrinterModels(
          (current) =>
            current?.map((item) => (item.id === id ? printerModel : item)),
          { revalidate: false }
        );
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutatePrinterModels]
  );

  return {
    createPrinterModel,
    error: error ? getErrorMessage(error) : null,
    fetchPrinterModels: useCallback(
      () => mutatePrinterModels(),
      [mutatePrinterModels]
    ),
    isLoading,
    printerModels: data ?? [],
    updatePrinterModel,
  };
}
