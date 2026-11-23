"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";

export default function OnboardingPage() {
  const { isSessionLoading, user } = useAuth();
  const router = useRouter();
  // Só redireciona se o onboarding já estava concluído ao chegar: concluir
  // aqui dentro atualiza `user`, mas quem navega é o wizard (depois da animação).
  const [wasCompletedOnArrival, setWasCompletedOnArrival] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    if (isSessionLoading || wasCompletedOnArrival !== null) {
      return;
    }

    const isCompleted = Boolean(user?.onboardingCompleted);
    setWasCompletedOnArrival(isCompleted);
    if (isCompleted) {
      router.replace("/home");
    }
  }, [isSessionLoading, router, user, wasCompletedOnArrival]);

  if (isSessionLoading || wasCompletedOnArrival !== false || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return <OnboardingWizard />;
}
