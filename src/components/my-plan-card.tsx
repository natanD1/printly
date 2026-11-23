"use client";

import { Check, Rocket, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyPlan } from "@/hooks/use-my-plan";
import type { MyPlanEntitlement } from "@/types/plan";

function formatProductHistoryText(limit: number | null): string {
  if (limit === null) {
    return "Histórico de produtos: ilimitado";
  }

  if (limit === 0) {
    return "Histórico de produtos: só o mês atual";
  }

  const suffix = limit === 1 ? "anterior" : "anteriores";
  return `Histórico de produtos: mês atual + ${limit} ${suffix}`;
}

function calculateUsagePercent(used: number | null, limit: number): number {
  if (limit === 0) {
    return 100;
  }

  return Math.min(100, Math.round(((used ?? 0) / limit) * 100));
}

function LimitEntitlementItem({
  entitlement,
}: {
  entitlement: MyPlanEntitlement;
}) {
  if (entitlement.key === "ProductHistoryMonths") {
    return (
      <p className="text-sm">{formatProductHistoryText(entitlement.limit)}</p>
    );
  }

  if (entitlement.limit === null) {
    return (
      <p className="text-sm">
        {entitlement.label}:{" "}
        <span className="text-muted-foreground">Ilimitado</span>
      </p>
    );
  }

  // Limite sem contagem (regra futura): mostra só o teto, sem barra.
  if (entitlement.used === null) {
    return (
      <p className="text-sm">
        {entitlement.label}: até {entitlement.limit}
      </p>
    );
  }

  const { used } = entitlement;
  const percentage = calculateUsagePercent(used, entitlement.limit);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span>{entitlement.label}</span>
        <span className="font-medium text-muted-foreground text-xs">
          {used} de {entitlement.limit}
        </span>
      </div>
      <Progress
        indicatorClassName={percentage >= 100 ? "bg-destructive" : "bg-primary"}
        value={percentage}
      />
    </div>
  );
}

function FeatureEntitlementItem({
  entitlement,
}: {
  entitlement: MyPlanEntitlement;
}) {
  const isEnabled = Boolean(entitlement.enabled);

  return (
    <li
      className={
        isEnabled
          ? "flex items-center gap-2 text-sm"
          : "flex items-center gap-2 text-muted-foreground text-sm"
      }
    >
      {isEnabled ? (
        <Check
          aria-hidden="true"
          className="size-4 shrink-0 text-emerald-500 dark:text-emerald-400"
        />
      ) : (
        <X
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
      )}
      <span>{entitlement.label}</span>
    </li>
  );
}

export function MyPlanCard() {
  const { error, isLoading, myPlan } = useMyPlan();

  const limitEntitlements =
    myPlan?.entitlements.filter((item) => item.type === "limit") ?? [];
  const featureEntitlements =
    myPlan?.entitlements.filter((item) => item.type === "feature") ?? [];

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 dark:text-violet-400">
            <Rocket aria-hidden="true" className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <CardTitle>Meu plano</CardTitle>
            <CardDescription>
              Limites e recursos incluídos na sua conta
            </CardDescription>
          </div>
        </div>
        {!isLoading && myPlan ? (
          <CardAction>
            <Badge variant="secondary">Plano {myPlan.planName}</Badge>
          </CardAction>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {isLoading ? <Skeleton className="h-32 w-full rounded-lg" /> : null}

        {!isLoading && error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}

        {!isLoading && myPlan?.isAdmin ? (
          <p className="rounded-lg border bg-muted/30 px-3 py-2.5 text-muted-foreground text-sm">
            Administrador: sem limites de uso.
          </p>
        ) : null}

        {!isLoading && myPlan && !myPlan.isAdmin ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {limitEntitlements.length > 0 ? (
              <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
                <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Limites
                </h3>
                <div className="flex flex-col gap-3">
                  {limitEntitlements.map((entitlement) => (
                    <LimitEntitlementItem
                      entitlement={entitlement}
                      key={entitlement.key}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {featureEntitlements.length > 0 ? (
              <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
                <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Recursos
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {featureEntitlements.map((entitlement) => (
                    <FeatureEntitlementItem
                      entitlement={entitlement}
                      key={entitlement.key}
                    />
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>

      {!isLoading && myPlan ? (
        <CardFooter className="flex-wrap justify-between gap-3">
          <span className="text-muted-foreground text-xs">
            {myPlan.isAdmin
              ? "Consulte a página pública de planos e valores."
              : "Precisa de mais limites ou recursos? Compare os planos disponíveis."}
          </span>
          <Button
            nativeButton={false}
            render={<Link href="/assinatura" />}
            size="sm"
            variant="outline"
          >
            <Rocket />
            Ver planos
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
