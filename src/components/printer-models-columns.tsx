"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CircleCheck, Ghost } from "lucide-react";
import { PrinterModelRowActions } from "@/components/printer-model-row-actions";
import type { PrinterModelSchema } from "@/schemas/printer-model-schema";
import type { PrinterModel } from "@/types/printer-model";
import { parseBrazilianDate } from "@/utils/parse-brazilian-date";

function formatDate(value: string): string {
  return parseBrazilianDate(value).toLocaleDateString("pt-BR");
}

export function buildPrinterModelsColumns(
  onUpdate: (
    id: string,
    data: PrinterModelSchema,
    isActive: boolean
  ) => Promise<void>
): ColumnDef<PrinterModel>[] {
  return [
    {
      accessorKey: "name",
      cell: ({ row }) => {
        const { name, image } = row.original;

        return (
          <div className="flex items-center gap-2">
            {image ? (
              // biome-ignore lint/performance/noImgElement: preview de base64 vindo da API, sem otimização de imagem aplicável
              <img
                alt={name}
                className="size-8 rounded-md border border-input object-cover"
                height={32}
                src={`data:image/png;base64,${image}`}
                width={32}
              />
            ) : (
              <div className="size-8 rounded-md bg-muted" />
            )}
            <span>{name}</span>
          </div>
        );
      },
      header: "Modelo",
    },
    {
      accessorKey: "brandName",
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
        <PrinterModelRowActions
          onUpdate={onUpdate}
          printerModel={row.original}
        />
      ),
      header: "Ações",
      id: "actions",
    },
  ];
}
