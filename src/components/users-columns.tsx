"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { UserRowActions } from "@/components/user-row-actions";
import type { ManagedUser, Plan } from "@/types/plan";
import { parseBrazilianDate } from "@/utils/parse-brazilian-date";

function formatDateTime(value: string): string {
  return parseBrazilianDate(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function buildUsersColumns(
  plans: Plan[],
  onChangePlan: (userId: string, planId: string) => Promise<void>
): ColumnDef<ManagedUser>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
    },
    {
      accessorKey: "email",
      header: "E-mail",
    },
    {
      accessorKey: "planName",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.planName}</Badge>
      ),
      header: "Plano",
    },
    {
      accessorKey: "isAdmin",
      cell: ({ row }) =>
        row.original.isAdmin ? <Badge variant="secondary">Admin</Badge> : null,
      header: "Admin",
    },
    {
      accessorKey: "createdAt",
      cell: ({ row }) => formatDateTime(row.original.createdAt),
      header: "Cadastro",
    },
    {
      cell: ({ row }) => (
        <UserRowActions
          onChangePlan={onChangePlan}
          plans={plans}
          user={row.original}
        />
      ),
      header: "Ações",
      id: "actions",
    },
  ];
}
