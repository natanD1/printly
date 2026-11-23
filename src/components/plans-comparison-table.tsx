"use client";

import { Check, X } from "lucide-react";
import { Fragment, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  AvailablePlan,
  EntitlementDefinition,
  PlanEntitlement,
} from "@/types/plan";
import {
  formatEntitlementValue,
  isEntitlementIncluded,
} from "@/utils/format-entitlement-value";
import { formatPlanPrice } from "@/utils/format-plan-price";

interface PlansComparisonTableProps {
  plans: AvailablePlan[];
  rules: EntitlementDefinition[];
}

interface ComparisonCellValueProps {
  entitlement: PlanEntitlement | undefined;
  rule: EntitlementDefinition;
}

function groupRules(
  rules: EntitlementDefinition[]
): [string, EntitlementDefinition[]][] {
  const groups = new Map<string, EntitlementDefinition[]>();

  for (const rule of rules) {
    const items = groups.get(rule.group) ?? [];
    items.push(rule);
    groups.set(rule.group, items);
  }

  return [...groups.entries()];
}

function ComparisonCellValue({ entitlement, rule }: ComparisonCellValueProps) {
  const displayValue = formatEntitlementValue(rule, entitlement);

  if (rule.type === "limit") {
    return <span className="text-sm">{displayValue}</span>;
  }

  const included = isEntitlementIncluded(rule, entitlement);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        included ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {included ? (
        <Check aria-hidden="true" className="size-4 shrink-0 text-primary" />
      ) : (
        <X
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
      )}
      <span>{displayValue}</span>
    </span>
  );
}

export function PlansComparisonTable({
  plans,
  rules,
}: PlansComparisonTableProps) {
  const groups = useMemo(() => groupRules(rules), [rules]);

  const entitlementsByPlanId = useMemo(() => {
    const map = new Map<string, Map<string, PlanEntitlement>>();

    for (const plan of plans) {
      map.set(
        plan.id,
        new Map(plan.entitlements.map((item) => [item.key, item]))
      );
    }

    return map;
  }, [plans]);

  const totalColumns = plans.length + 1;
  const tableMinWidth = 220 + plans.length * 160;

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table style={{ minWidth: `${tableMinWidth}px` }}>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead
              className="sticky left-0 z-10 h-auto w-56 bg-card px-4 py-3 font-semibold"
              scope="col"
            >
              Recurso
            </TableHead>
            {plans.map((plan) => (
              <TableHead
                className={cn(
                  "h-auto px-4 py-3",
                  plan.isCurrent ? "bg-primary/5" : undefined
                )}
                key={plan.id}
                scope="col"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{plan.name}</span>
                  {plan.isCurrent ? <Badge>Seu plano</Badge> : null}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableHead
              className="sticky left-0 z-10 h-auto bg-card px-4 py-3 font-medium"
              scope="row"
            >
              Preço
            </TableHead>
            {plans.map((plan) => {
              const price = formatPlanPrice(plan.monthlyPrice);

              return (
                <TableCell
                  className={cn(
                    "px-4 py-3",
                    plan.isCurrent ? "bg-primary/5" : undefined
                  )}
                  key={plan.id}
                >
                  <span className="font-semibold">{price.amount}</span>
                  {price.period ? (
                    <span className="text-muted-foreground text-xs">
                      {price.period}
                    </span>
                  ) : null}
                </TableCell>
              );
            })}
          </TableRow>

          {groups.map(([group, groupItems]) => (
            <Fragment key={group}>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableCell
                  className="px-4 py-2 font-bold text-foreground text-xs uppercase tracking-wide"
                  colSpan={totalColumns}
                >
                  <span className="sticky left-4 z-10 inline-block">
                    {group}
                  </span>
                </TableCell>
              </TableRow>

              {groupItems.map((rule) => (
                <TableRow key={rule.key}>
                  <TableHead
                    className="sticky left-0 z-10 h-auto whitespace-normal bg-card px-4 py-3"
                    scope="row"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">{rule.label}</span>
                      <span className="font-normal text-muted-foreground text-xs">
                        {rule.description}
                      </span>
                    </div>
                  </TableHead>
                  {plans.map((plan) => {
                    const entitlement = entitlementsByPlanId
                      .get(plan.id)
                      ?.get(rule.key);

                    return (
                      <TableCell
                        className={cn(
                          "px-4 py-3",
                          plan.isCurrent ? "bg-primary/5" : undefined
                        )}
                        key={plan.id}
                      >
                        <ComparisonCellValue
                          entitlement={entitlement}
                          rule={rule}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
