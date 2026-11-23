"use client";

import axios from "axios";
import useSWR from "swr";
import { getEntitlementCatalogRequest } from "@/app/api/plans/entitlement-catalog/request";
import type { ApiErrorResponse } from "@/types/auth";
import type { EntitlementDefinition } from "@/types/plan";

const PLAN_CATALOG_KEY = "plan-catalog";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  return "Erro inesperado";
}

export function usePlanCatalog() {
  const { data, error, isLoading } = useSWR<EntitlementDefinition[]>(
    PLAN_CATALOG_KEY,
    getEntitlementCatalogRequest
  );

  return {
    catalog: data ?? [],
    error: error ? getErrorMessage(error) : null,
    isLoading,
  };
}
