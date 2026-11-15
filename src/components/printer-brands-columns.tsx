"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CircleCheck, Ghost } from "lucide-react";
import { PrinterBrandRowActions } from "@/components/printer-brand-row-actions";
import type { PrinterBrandSchema } from "@/schemas/printer-brand-schema";
import type { PrinterBrand } from "@/types/printer-brand";
import { parseBrazilianDate } from "@/utils/parse-brazilian-date";

function formatDate(value: string): string {
  return parseBrazilianDate(value).toLocaleDateString("pt-BR");
}

export function buildPrinterBrandsColumns(
  onUpdate: (
    id: string,
    data: PrinterBrandSchema,
    isActive: boolean
  ) => Promise<void>
): ColumnDef<PrinterBrand>[] {
  return [
    {
      accessorKey: "name",
      header: "Marca",
    },
    {
      accessorKey: "createdAt",
      cell: ({ row }) => formatDate(row.original.createdAt),
      header: "Criado em",
    },
    {
      accessorKey: "isActive",
      cell: ({ row }) =>
        row.original.isActive ? (
          <CircleCheck className="size-4 text-emerald-500 dark:text-emerald-400" />
        ) : (
          <Ghost className="size-4 text-sky-500 dark:text-sky-400" />
        ),
      header: "Status",
    },
    {
      cell: ({ row }) => (
        <PrinterBrandRowActions
          onUpdate={onUpdate}
          printerBrand={row.original}
        />
      ),
      header: "Ações",
      id: "actions",
    },
  ];
}
