import { api } from "@/lib/api";
import type { CompanyProfileSchema } from "@/schemas/company-profile-schema";
import type { CompanyProfile } from "@/types/company-profile";

export function buildCompanyProfileFormData(
  data: CompanyProfileSchema
): FormData {
  const formData = new FormData();

  formData.append("Name", data.name);
  formData.append("Phone", data.phone);
  formData.append("Email", data.email);
  formData.append("WhatsApp", data.whatsApp);
  formData.append("Instagram", data.instagram);
  formData.append("Website", data.website);
  formData.append("RemoveLogo", String(data.removeLogo));

  if (data.logo) {
    formData.append("Logo", data.logo);
  }

  return formData;
}

export async function getCompanyProfileRequest(): Promise<CompanyProfile | null> {
  const response = await api.get<CompanyProfile | null>("/company-profile");

  return response.data ?? null;
}

export async function updateCompanyProfileRequest(
  data: CompanyProfileSchema
): Promise<CompanyProfile> {
  const response = await api.put<CompanyProfile>(
    "/company-profile",
    buildCompanyProfileFormData(data)
  );

  return response.data;
}
