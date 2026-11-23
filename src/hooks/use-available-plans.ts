"use client";

import axios from "axios";
import { useCallback } from "react";
import useSWR from "swr";
import { getAvailablePlansRequest } from "@/app/api/plans/available/request";
import type { ApiErrorResponse } from "@/types/auth";
import type { AvailablePlans } from "@/types/plan";

export const AVAILABLE_PLANS_KEY = "available-plans";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  return "Erro inesperado";
}

export function useAvailablePlans() {
  const {
    data,
    error,
    isLoading,
    mutate: mutateAvailablePlans,
  } = useSWR<AvailablePlans>(AVAILABLE_PLANS_KEY, getAvailablePlansRequest);

  return {
    availablePlans: data ?? null,
    error: error ? getErrorMessage(error) : null,
    fetchAvailablePlans: useCallback(
      () => mutateAvailablePlans(),
      [mutateAvailablePlans]
    ),
    isLoading,
  };
}
