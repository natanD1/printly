"use client";

import axios from "axios";
import { useCallback } from "react";
import useSWR from "swr";
import { getMyPlanRequest } from "@/app/api/plans/me/request";
import type { ApiErrorResponse } from "@/types/auth";
import type { MyPlan } from "@/types/plan";

export const MY_PLAN_KEY = "my-plan";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  return "Erro inesperado";
}

export function useMyPlan() {
  const {
    data,
    error,
    isLoading,
    mutate: mutateMyPlan,
  } = useSWR<MyPlan>(MY_PLAN_KEY, getMyPlanRequest);

  return {
    error: error ? getErrorMessage(error) : null,
    fetchMyPlan: useCallback(() => mutateMyPlan(), [mutateMyPlan]),
    isLoading,
    myPlan: data ?? null,
  };
}
