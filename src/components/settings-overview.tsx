"use client";

import { CompanyProfileForm } from "@/components/company-profile-form";
import { MyPlanCard } from "@/components/my-plan-card";
import { ProfileCard } from "@/components/profile-card";
import { SettingsForm } from "@/components/settings-form";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { useSettings } from "@/hooks/use-settings";

function SettingsBlockError({ message }: { message: string }) {
  return (
    <Card className="flex h-full items-center justify-center">
      <CardContent className="py-6">
        <p className="text-destructive text-sm" role="alert">
          {message}
        </p>
      </CardContent>
    </Card>
  );
}

export function SettingsOverview() {
  const { error, isLoading, settings, updateSettings } = useSettings();
  const {
    companyProfile,
    error: companyProfileError,
    isLoading: isCompanyProfileLoading,
    updateCompanyProfile,
  } = useCompanyProfile();

  const renderEnergyBlock = () => {
    if (error && !settings) {
      return <SettingsBlockError message={error} />;
    }

    if (isLoading || !settings) {
      return <Skeleton className="h-64 w-full rounded-xl" />;
    }

    return <SettingsForm onSubmit={updateSettings} settings={settings} />;
  };

  const renderCompanyBlock = () => {
    if (companyProfileError && companyProfile === undefined) {
      return <SettingsBlockError message={companyProfileError} />;
    }

    if (isCompanyProfileLoading || companyProfile === undefined) {
      return <Skeleton className="h-96 w-full rounded-xl" />;
    }

    return (
      <CompanyProfileForm
        companyProfile={companyProfile}
        onSubmit={updateCompanyProfile}
      />
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ProfileCard />
        {renderEnergyBlock()}
      </div>

      <MyPlanCard />

      {renderCompanyBlock()}
    </div>
  );
}
