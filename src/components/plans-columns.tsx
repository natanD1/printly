"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PlanRowActions } from "@/components/plan-row-actions";
import { Badge } from "@/components/ui/badge";
import type { Plan, SavePlanPayload } from "@/types/plan";
import { formatCurrency } from "@/utils/format-currency";

export function buildPlansColumns(
  onUpdate: (id: string, payload: SavePlanPayload) => Promise<void>,
  onDelete: (id: string) => Promise<void>
): ColumnDef<Plan>[] {
  return [
    {
      accessorKey: "name",
      cell: ({ row }) => {
        const { description, isDefault, isPublic, name } = row.original;

        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-medium">{name}</span>
              {isDefault ? <Badge variant="secondary">Padrão</Badge> : null}
              {isPublic ? null : <Badge variant="secondary">Oculto</Badge>}
            </div>
            {description ? (
              <span className="text-muted-foreground text-xs">
                {description}
              </span>
            ) : null}
          </div>
        );
      },
      header: "Plano",
    },
    {
      accessorKey: "monthlyPrice",
      cell: ({ row }) => formatCurrency(row.original.monthlyPrice),
      header: "Preço mensal",
    },
    {
      accessorKey: "isActive",
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge
            className="border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400"
            variant="outline"
          >
            Ativo
          </Badge>
        ) : (
          <Badge className="bg-muted text-muted-foreground" variant="outline">
            Inativo
          </Badge>
        ),
      header: "Status",
    },
    {
      accessorKey: "userCount",
      cell: ({ row }) => row.original.userCount.toLocaleString("pt-BR"),
      header: "Usuários",
    },
    {
      cell: ({ row }) => (
        <PlanRowActions
          onDelete={onDelete}
          onUpdate={onUpdate}
          plan={row.original}
        />
      ),
      header: "Ações",
      id: "actions",
    },
  ];
}
