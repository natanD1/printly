"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FieldError } from "@/components/field-error";
import { OnboardingCompanyStep } from "@/components/onboarding-company-step";
import { OnboardingEnergyStep } from "@/components/onboarding-energy-step";
import { OnboardingFilamentsStep } from "@/components/onboarding-filaments-step";
import { OnboardingPreparing } from "@/components/onboarding-preparing";
import { OnboardingPrinterStep } from "@/components/onboarding-printer-step";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { type OnboardingStep, useOnboarding } from "@/hooks/use-onboarding";
import { cn } from "@/lib/utils";

const STEPS = [
  { name: "Empresa", step: 1 },
  { name: "Energia", step: 2 },
  { name: "Impressora", step: 3 },
  { name: "Filamentos", step: 4 },
] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const { completeOnboarding, error, initialStep, isLoading, reload } =
    useOnboarding();
  const [step, setStep] = useState<OnboardingStep | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const isCompletingRef = useRef<boolean>(false as boolean);

  // Define a etapa inicial uma única vez: revalidações depois não mexem nela.
  useEffect(() => {
    if (step === null && initialStep !== null) {
      setStep(initialStep);
    }
  }, [initialStep, step]);

  const finish = useCallback(async () => {
    if (isCompletingRef.current) {
      return;
    }
    isCompletingRef.current = true;
    setIsFinishing(true);
    setFinishError(null);
    try {
      await completeOnboarding();
      setIsDone(true);
    } catch (caughtError) {
      setFinishError(
        caughtError instanceof Error ? caughtError.message : "Erro inesperado"
      );
      isCompletingRef.current = false;
    }
  }, [completeOnboarding]);

  const goTo = useCallback((next: OnboardingStep) => setStep(next), []);
  const goToCompany = useCallback(() => goTo(1), [goTo]);
  const goToEnergy = useCallback(() => goTo(2), [goTo]);
  const goToPrinter = useCallback(() => goTo(3), [goTo]);
  const goToFilaments = useCallback(() => goTo(4), [goTo]);
  const handleFinished = useCallback(() => router.replace("/home"), [router]);

  if (isFinishing) {
    return (
      <div className="flex w-full max-w-xl flex-1 flex-col justify-center">
        <OnboardingPreparing
          error={finishError}
          isDone={isDone}
          onFinished={handleFinished}
          onRetry={finish}
        />
      </div>
    );
  }

  if (error && step === null) {
    return (
      <div className="flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-3 text-center">
        <FieldError message={error} />
        <Button onClick={reload} variant="outline">
          Tentar de novo
        </Button>
      </div>
    );
  }

  if (isLoading || step === null) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="font-semibold text-lg">Vamos configurar o Printly</h1>
          <span className="text-muted-foreground text-sm">
            Etapa {step} de {STEPS.length}
          </span>
        </div>
        <Progress
          aria-label={`Etapa ${step} de ${STEPS.length}`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={(step / STEPS.length) * 100}
          indicatorClassName="bg-primary"
          role="progressbar"
          value={(step / STEPS.length) * 100}
        />
        <ol className="grid grid-cols-4 gap-1 text-center text-xs">
          {STEPS.map((item) => {
            const isCompleted = item.step < step;
            const isCurrent = item.step === step;

            return (
              <li
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 text-muted-foreground",
                  isCurrent && "font-medium text-foreground"
                )}
                key={item.step}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border text-[0.65rem]",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary text-primary"
                  )}
                >
                  {isCompleted ? <Check className="size-3" /> : item.step}
                </span>
                {item.name}
              </li>
            );
          })}
        </ol>
      </div>

      {step === 1 ? <OnboardingCompanyStep onDone={goToEnergy} /> : null}
      {step === 2 ? (
        <OnboardingEnergyStep onBack={goToCompany} onDone={goToPrinter} />
      ) : null}
      {step === 3 ? (
        <OnboardingPrinterStep
          onBack={goToEnergy}
          onDone={goToFilaments}
          onSkip={goToFilaments}
        />
      ) : null}
      {step === 4 ? (
        <OnboardingFilamentsStep
          onBack={goToPrinter}
          onDone={finish}
          onSkip={finish}
        />
      ) : null}
    </div>
  );
}
