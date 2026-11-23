"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";

export function OnboardingGate({ children }: { children: ReactNode }) {
  const { isSessionLoading, user } = useAuth();
  const router = useRouter();
  const mustOnboard = Boolean(user && !user.onboardingCompleted);

  useEffect(() => {
    if (!isSessionLoading && mustOnboard) {
      router.replace("/onboarding");
    }
  }, [isSessionLoading, mustOnboard, router]);

  if (isSessionLoading || mustOnboard) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return children;
}
