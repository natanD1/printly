"use client";

import axios from "axios";
import { useCallback } from "react";
import useSWR from "swr";
import { updatePrinterBrandRequest } from "@/app/api/printer-brands/[id]/request";
import {
  createPrinterBrandRequest,
  getPrinterBrandsRequest,
} from "@/app/api/printer-brands/request";
import type { PrinterBrandSchema } from "@/schemas/printer-brand-schema";
import type { ApiErrorResponse } from "@/types/auth";
import type { PrinterBrand } from "@/types/printer-brand";

const PRINTER_BRANDS_KEY = "printer-brands";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  return "Erro inesperado";
}

export function usePrinterBrands() {
  const {
    data,
    error,
    isLoading,
    mutate: mutatePrinterBrands,
  } = useSWR<PrinterBrand[]>(PRINTER_BRANDS_KEY, getPrinterBrandsRequest);

  const createPrinterBrand = useCallback(
    async (formData: PrinterBrandSchema) => {
      try {
        const printerBrand = await createPrinterBrandRequest(formData);
        await mutatePrinterBrands(
          (current) => [printerBrand, ...(current ?? [])],
          { revalidate: false }
        );
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutatePrinterBrands]
  );

  const updatePrinterBrand = useCallback(
    async (id: string, formData: PrinterBrandSchema, isActive: boolean) => {
      try {
        const printerBrand = await updatePrinterBrandRequest(
          id,
          formData,
          isActive
        );
        await mutatePrinterBrands(
          (current) =>
            current?.map((item) => (item.id === id ? printerBrand : item)),
          { revalidate: false }
        );
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutatePrinterBrands]
  );

  return {
    createPrinterBrand,
    error: error ? getErrorMessage(error) : null,
    fetchPrinterBrands: useCallback(
      () => mutatePrinterBrands(),
      [mutatePrinterBrands]
    ),
    isLoading,
    printerBrands: data ?? [],
    updatePrinterBrand,
  };
}
