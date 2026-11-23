"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { PlanFormDialog } from "@/components/plan-form-dialog";
import { buildPlansColumns } from "@/components/plans-columns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlans } from "@/hooks/use-plans";

export function PlansOverview() {
  const {
    createPlan,
    deletePlan,
    error,
    fetchPlans,
    isLoading,
    plans,
    updatePlan,
  } = usePlans();

  const columns = useMemo(
    () => buildPlansColumns(updatePlan, deletePlan),
    [deletePlan, updatePlan]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-heading font-semibold text-xl">Planos</h1>
          <p className="text-muted-foreground text-sm">
            Limites e recursos de cada plano. As regras são aplicadas pelo
            sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchPlans} size="lg" variant="outline">
            <RefreshCw />
            Atualizar
          </Button>
          <PlanFormDialog
            onSubmit={createPlan}
            trigger={
              <Button size="lg">
                <Plus />
                Novo plano
              </Button>
            }
          />
        </div>
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <DataTable
          columns={columns}
          data={plans}
          emptyMessage="Nenhum plano cadastrado."
          pageSize={10}
        />
      )}
    </div>
  );
}
