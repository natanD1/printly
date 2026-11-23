"use client";

import { Check } from "lucide-react";
import { PlanCtaButton } from "@/components/plan-cta-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { AvailablePlan, EntitlementDefinition } from "@/types/plan";
import {
  formatEntitlementValue,
  isEntitlementIncluded,
} from "@/utils/format-entitlement-value";
import { formatPlanPrice } from "@/utils/format-plan-price";

const MAX_HIGHLIGHTS = 6;

interface PlanHighlight {
  isFeature: boolean;
  key: string;
  text: string;
}

interface PlanCardProps {
  plan: AvailablePlan;
  rules: EntitlementDefinition[];
}

function getPlanHighlights(
  plan: AvailablePlan,
  rules: EntitlementDefinition[]
): PlanHighlight[] {
  const entitlementsByKey = new Map(
    plan.entitlements.map((entitlement) => [entitlement.key, entitlement])
  );

  const limitItems: PlanHighlight[] = [];
  const featureItems: PlanHighlight[] = [];

  for (const rule of rules) {
    const entitlement = entitlementsByKey.get(rule.key);

    if (rule.type === "limit") {
      const value = formatEntitlementValue(rule, entitlement);
      limitItems.push({
        isFeature: false,
        key: rule.key,
        text: `${rule.label}: ${value}`,
      });
    } else if (isEntitlementIncluded(rule, entitlement)) {
      featureItems.push({
        isFeature: true,
        key: rule.key,
        text: rule.label,
      });
    }
  }

  return [...limitItems, ...featureItems].slice(0, MAX_HIGHLIGHTS);
}

export function PlanCard({ plan, rules }: PlanCardProps) {
  const price = formatPlanPrice(plan.monthlyPrice);
  const highlights = getPlanHighlights(plan, rules);

  return (
    <Card
      className={cn(
        "flex flex-col [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(6)]",
        plan.isCurrent
          ? "ring-2 ring-primary"
          : "transition-shadow hover:shadow-md"
      )}
    >
      <CardHeader className="gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="font-semibold text-lg">{plan.name}</CardTitle>
          {plan.isCurrent ? <Badge>Seu plano atual</Badge> : null}
        </div>
        {plan.description ? (
          <CardDescription>{plan.description}</CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1">
            <span className="font-bold font-heading text-4xl tracking-tight">
              {price.amount}
            </span>
            {price.period ? (
              <span className="font-medium text-muted-foreground text-sm">
                {price.period}
              </span>
            ) : null}
          </div>
          <span className="text-muted-foreground text-xs">
            {plan.monthlyPrice === 0 ? "Sem custo mensal" : "Cobrança mensal"}
          </span>
        </div>

        <Separator />

        {highlights.length > 0 ? (
          <ul className="flex flex-col gap-2.5">
            {highlights.map((item) => (
              <li className="flex items-start gap-2.5 text-sm" key={item.key}>
                {item.isFeature ? (
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-primary"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center"
                  >
                    <span className="size-1.5 rounded-full bg-primary/70" />
                  </span>
                )}
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>

      <CardFooter>
        <PlanCtaButton isCurrent={plan.isCurrent} plan={plan} />
      </CardFooter>
    </Card>
  );
}
