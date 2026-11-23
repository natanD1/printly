"use client";

import { useMyPlan } from "@/hooks/use-my-plan";
import type { PlanEntitlementKey } from "@/types/plan";

/**
 * Reflete uma regra do plano do usuário logado. Enquanto carrega ou em erro
 * não bloqueia nada: o backend é a trava de verdade.
 */
export function useEntitlement(key: PlanEntitlementKey) {
  const { error, isLoading, myPlan } = useMyPlan();

  if (isLoading || error || !myPlan || myPlan.isAdmin) {
    return {
      canCreate: true,
      enabled: true,
      isLoading,
      limit: null,
      used: null,
    };
  }

  const entry = myPlan.entitlements.find((item) => item.key === key);
  const limit = entry?.limit ?? null;
  const used = entry?.used ?? null;

  return {
    canCreate: limit === null || used === null || used < limit,
    enabled: entry?.enabled === true,
    isLoading,
    limit,
    used,
  };
}
