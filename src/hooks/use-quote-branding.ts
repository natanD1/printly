"use client";

import { useEntitlement } from "@/hooks/use-entitlement";
import { useMyPlan } from "@/hooks/use-my-plan";

/**
 * Regras de marca do PDF de orçamento pelo plano. `useEntitlement` libera tudo
 * enquanto carrega; aqui o PDF só deve ser gerado com `isReady`, pra não piscar
 * o logo/rodapé errado. Em erro ao carregar o plano: sem logo da empresa e com
 * rodapé (conservador).
 */
export function useQuoteBranding() {
  const { error, isLoading, myPlan } = useMyPlan();
  const companyLogo = useEntitlement("CompanyLogoInQuote");
  const removeFooter = useEntitlement("RemoveBrandingFooter");
  const hasPlan = Boolean(myPlan) && !error;

  return {
    isReady: !isLoading,
    showBrandingFooter: !(hasPlan && removeFooter.enabled),
    showCompanyLogo: hasPlan && companyLogo.enabled,
  };
}
