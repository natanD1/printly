"use client";

import axios from "axios";
import { useCallback } from "react";
import useSWR from "swr";
import {
  getCompanyProfileRequest,
  updateCompanyProfileRequest,
} from "@/app/api/company-profile/request";
import type { CompanyProfileSchema } from "@/schemas/company-profile-schema";
import type { ApiErrorResponse } from "@/types/auth";
import type { CompanyProfile } from "@/types/company-profile";

const COMPANY_PROFILE_KEY = "company-profile";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  return "Erro inesperado";
}

export function useCompanyProfile() {
  const {
    data,
    error,
    isLoading,
    mutate: mutateCompanyProfile,
  } = useSWR<CompanyProfile | null>(
    COMPANY_PROFILE_KEY,
    getCompanyProfileRequest
  );

  const updateCompanyProfile = useCallback(
    async (formData: CompanyProfileSchema) => {
      try {
        const companyProfile = await updateCompanyProfileRequest(formData);
        await mutateCompanyProfile(companyProfile, { revalidate: false });
      } catch (caughtError) {
        throw new Error(getErrorMessage(caughtError), { cause: caughtError });
      }
    },
    [mutateCompanyProfile]
  );

  return {
    companyProfile: data,
    error: error ? getErrorMessage(error) : null,
    fetchCompanyProfile: useCallback(
      () => mutateCompanyProfile(),
      [mutateCompanyProfile]
    ),
    isLoading,
    updateCompanyProfile,
  };
}
