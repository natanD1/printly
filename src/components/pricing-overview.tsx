"use client";

import { CreditCard, Info } from "lucide-react";
import { useCallback } from "react";
import { PlanCard } from "@/components/plan-card";
import { PlansComparisonTable } from "@/components/plans-comparison-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailablePlans } from "@/hooks/use-available-plans";
import { useMyPlan } from "@/hooks/use-my-plan";
import { cn } from "@/lib/utils";

function getPlansGridClassName(planCount: number): string {
  if (planCount === 1) {
    return "mx-auto grid w-full max-w-md gap-6";
  }

  if (planCount === 2) {
    return "mx-auto grid w-full max-w-3xl gap-6 sm:grid-cols-2";
  }

  return "grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3";
}

function PricingSkeleton() {
  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function PricingOverview() {
  const { availablePlans, error, fetchAvailablePlans, isLoading } =
    useAvailablePlans();
  const { myPlan } = useMyPlan();

  const handleRetry = useCallback(() => {
    fetchAvailablePlans().catch(() => null);
  }, [fetchAvailablePlans]);

  if (isLoading) {
    return <PricingSkeleton />;
  }

  // Revalidação que falha com dados em cache mantém a página (o SWR preenche `error` mesmo assim).
  if (error && !availablePlans) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center">
        <p className="text-destructive text-sm">{error}</p>
        <Button onClick={handleRetry} variant="outline">
          Tentar de novo
        </Button>
      </div>
    );
  }

  if (!availablePlans) {
    return null;
  }

  if (availablePlans.plans.length === 0) {
    return (
      <div className="flex min-h-48 flex-1 items-center justify-center p-8 text-center text-muted-foreground text-sm">
        Nenhum plano disponível no momento.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {myPlan?.isAdmin ? (
        <div
          className="mx-auto flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2 text-muted-foreground text-sm"
          role="status"
        >
          <Info aria-hidden="true" className="size-4 shrink-0 text-primary" />
          <span>Administradores não têm limites de uso.</span>
        </div>
      ) : null}

      <section aria-label="Planos disponíveis" className="flex flex-col gap-4">
        <div className={cn(getPlansGridClassName(availablePlans.plans.length))}>
          {availablePlans.plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} rules={availablePlans.rules} />
          ))}
        </div>

        {availablePlans.plans.length === 1 ? (
          <p className="text-center text-muted-foreground text-sm">
            Novos planos em breve.
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="font-heading font-semibold text-xl sm:text-2xl">
            Compare todos os recursos
          </h2>
          <p className="text-muted-foreground text-sm">
            Veja em detalhes os limites e funcionalidades incluídos em cada
            plano.
          </p>
        </div>
        <PlansComparisonTable
          plans={availablePlans.plans}
          rules={availablePlans.rules}
        />
      </section>

      <div className="mx-auto flex max-w-2xl items-center justify-center gap-2.5 rounded-xl border bg-card px-4 py-3 text-center text-muted-foreground text-sm">
        <CreditCard
          aria-hidden="true"
          className="size-4 shrink-0 text-primary"
        />
        <span>
          A assinatura online com pagamento automático chega em breve. Para
          mudar de plano agora, fale com o suporte.
        </span>
      </div>
    </div>
  );
}
