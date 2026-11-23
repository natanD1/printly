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
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
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

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {isLoading ? (
        <Skeleton className="min-h-96 w-full flex-1" />
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
