"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import type { QuoteCompany } from "@/types/quote";

/** Dados da empresa pro orçamento; sem perfil, cai pro nome do usuário logado. */
export function useQuoteCompany(): {
  company: QuoteCompany;
  isLoading: boolean;
} {
  const { user } = useAuth();
  const { companyProfile, isLoading } = useCompanyProfile();

  const company = useMemo<QuoteCompany>(
    () =>
      companyProfile
        ? {
            email: companyProfile.email,
            instagram: companyProfile.instagram,
            logoBase64: companyProfile.logoBase64,
            name: companyProfile.name,
            phone: companyProfile.phone,
            website: companyProfile.website,
            whatsApp: companyProfile.whatsApp,
          }
        : {
            email: null,
            instagram: null,
            logoBase64: null,
            name: user?.name ?? "Printly",
            phone: null,
            website: null,
            whatsApp: null,
          },
    [companyProfile, user?.name]
  );

  return { company, isLoading };
}
