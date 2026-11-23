"use client";

import axios from "axios";
import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import { changeUserPlanRequest } from "@/app/api/users/[id]/plan/request";
import { getManagedUsersRequest } from "@/app/api/users/request";
import { AVAILABLE_PLANS_KEY } from "@/hooks/use-available-plans";
import { MY_PLAN_KEY } from "@/hooks/use-my-plan";
import type { ApiErrorResponse } from "@/types/auth";
import type { ManagedUser } from "@/types/plan";

const MANAGED_USERS_KEY = "managed-users";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  return "Erro inesperado";
}

export function useManagedUsers() {
  const {
    data,
    error,
    isLoading,
    mutate: mutateUsers,
  } = useSWR<ManagedUser[]>(MANAGED_USERS_KEY, getManagedUsersRequest);
  const { mutate: mutateAll } = useSWRConfig();

  const changeUserPlan = useCallback(
    async (userId: string, planId: string) => {
      try {
        const user = await changeUserPlanRequest(userId, planId);
        await mutateUsers(
          (current) =>
            current?.map((item) => (item.id === userId ? user : item)),
          { revalidate: false }
        );
        // O admin pode ter trocado o próprio plano.
        await mutateAll(MY_PLAN_KEY);
        await mutateAll(AVAILABLE_PLANS_KEY);
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutateAll, mutateUsers]
  );

  return {
    changeUserPlan,
    error: error ? getErrorMessage(error) : null,
    fetchUsers: useCallback(() => mutateUsers(), [mutateUsers]),
    isLoading,
    users: data ?? [],
  };
}
