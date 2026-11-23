"use client";

import axios from "axios";
import { useCallback } from "react";
import { useSWRConfig } from "swr";
import { completeOnboardingRequest } from "@/app/api/auth/onboarding/complete/request";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { usePrinters } from "@/hooks/use-printers";
import { useSettings } from "@/hooks/use-settings";
import type { ApiErrorResponse } from "@/types/auth";

export type OnboardingStep = 1 | 2 | 3 | 4;

// Mesmas keys de `useCompanyProfile`, `usePrinters` e `useFilaments`.
// `useSettings` não usa SWR (estado local), então não há cache dele pra revalidar.
const REVALIDATE_KEYS = ["company-profile", "printers", "filaments"] as const;

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  return "Erro inesperado";
}

export function useOnboarding() {
  const { setCurrentUser } = useAuth();
  const { mutate } = useSWRConfig();
  const {
    companyProfile,
    error: companyError,
    fetchCompanyProfile,
    isLoading: isCompanyLoading,
  } = useCompanyProfile();
  const { error: settingsError, fetchSettings, settings } = useSettings();
  const {
    error: printersError,
    fetchPrinters,
    isLoading: isPrintersLoading,
    printers,
  } = usePrinters();

  const error = companyError ?? settingsError ?? printersError;
  const isLoading =
    !error && (isCompanyLoading || isPrintersLoading || settings === null);

  let initialStep: OnboardingStep | null = null;
  if (!(isLoading || error)) {
    if (!companyProfile) {
      initialStep = 1;
    } else if (settings?.updatedAt === null) {
      initialStep = 2;
    } else if (printers.length === 0) {
      initialStep = 3;
    } else {
      initialStep = 4;
    }
  }

  const reload = useCallback(() => {
    fetchCompanyProfile();
    fetchSettings();
    fetchPrinters();
  }, [fetchCompanyProfile, fetchSettings, fetchPrinters]);

  const completeOnboarding = useCallback(async () => {
    try {
      const user = await completeOnboardingRequest();
      setCurrentUser(user);
      for (const key of REVALIDATE_KEYS) {
        mutate(key).catch(() => null);
      }
    } catch (caughtError) {
      throw new Error(getErrorMessage(caughtError), { cause: caughtError });
    }
  }, [mutate, setCurrentUser]);

  return { completeOnboarding, error, initialStep, isLoading, reload };
}
