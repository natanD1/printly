"use client";

import axios from "axios";
import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import {
  deletePlanRequest,
  updatePlanRequest,
} from "@/app/api/plans/[id]/request";
import { createPlanRequest, getPlansRequest } from "@/app/api/plans/request";
import { AVAILABLE_PLANS_KEY } from "@/hooks/use-available-plans";
import { MY_PLAN_KEY } from "@/hooks/use-my-plan";
import type { ApiErrorResponse } from "@/types/auth";
import type { Plan, SavePlanPayload } from "@/types/plan";

const PLANS_KEY = "plans";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  return "Erro inesperado";
}

export function usePlans() {
  const {
    data,
    error,
    isLoading,
    mutate: mutatePlans,
  } = useSWR<Plan[]>(PLANS_KEY, getPlansRequest);
  const { mutate: mutateAll } = useSWRConfig();

  const createPlan = useCallback(
    async (payload: SavePlanPayload) => {
      try {
        await createPlanRequest(payload);
        // Marcar como padrão desmarca outro plano e muda contagens: revalida a lista.
        await mutatePlans();
        await mutateAll(MY_PLAN_KEY);
        await mutateAll(AVAILABLE_PLANS_KEY);
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutateAll, mutatePlans]
  );

  const updatePlan = useCallback(
    async (id: string, payload: SavePlanPayload) => {
      try {
        await updatePlanRequest(id, payload);
        await mutatePlans();
        await mutateAll(MY_PLAN_KEY);
        await mutateAll(AVAILABLE_PLANS_KEY);
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutateAll, mutatePlans]
  );

  const deletePlan = useCallback(
    async (id: string) => {
      try {
        await deletePlanRequest(id);
        await mutatePlans(
          (current) => current?.filter((item) => item.id !== id),
          { revalidate: false }
        );
        await mutateAll(MY_PLAN_KEY);
        await mutateAll(AVAILABLE_PLANS_KEY);
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutateAll, mutatePlans]
  );

  return {
    createPlan,
    deletePlan,
    error: error ? getErrorMessage(error) : null,
    fetchPlans: useCallback(() => mutatePlans(), [mutatePlans]),
    isLoading,
    plans: data ?? [],
    updatePlan,
  };
}
