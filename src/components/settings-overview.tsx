"use client";

import { CompanyProfileForm } from "@/components/company-profile-form";
import { ProfileCard } from "@/components/profile-card";
import { SettingsForm } from "@/components/settings-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { useSettings } from "@/hooks/use-settings";

export function SettingsOverview() {
  const { error, isLoading, settings, updateSettings } = useSettings();
  const {
    companyProfile,
    error: companyProfileError,
    isLoading: isCompanyProfileLoading,
    updateCompanyProfile,
  } = useCompanyProfile();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <ProfileCard />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {isLoading || !settings ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <SettingsForm onSubmit={updateSettings} settings={settings} />
      )}

      <div className="sm:col-span-2">
        {companyProfileError ? (
          <p className="mb-4 text-destructive text-sm">{companyProfileError}</p>
        ) : null}

        {isCompanyProfileLoading ||
        (companyProfile === undefined && !companyProfileError) ? (
          <Skeleton className="h-96 w-full" />
        ) : null}

        {!isCompanyProfileLoading && companyProfile !== undefined ? (
          <CompanyProfileForm
            companyProfile={companyProfile}
            onSubmit={updateCompanyProfile}
          />
        ) : null}
      </div>
    </div>
  );
}
