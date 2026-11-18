"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ProductRowActions } from "@/components/product-row-actions";
import { Badge } from "@/components/ui/badge";
import type { ProductSchema } from "@/schemas/product-schema";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/utils/format-currency";
import { formatWeight } from "@/utils/format-weight";
import { parseBrazilianDate } from "@/utils/parse-brazilian-date";

export function buildProductsColumns(
  onDelete: (id: string) => Promise<void>,
  onUpdate: (id: string, data: ProductSchema) => Promise<void>,
  onSetProduced: (id: string, isProduced: boolean) => Promise<void>
): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "productName",
      header: "Nome do produto",
    },
    {
      accessorKey: "isProduced",
      cell: ({ row }) =>
        row.original.isProduced ? (
          <Badge
            className="border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400"
            variant="outline"
          >
            Produzido
          </Badge>
        ) : (
          <Badge
            className="border-border bg-muted text-muted-foreground"
            variant="outline"
          >
            Orçamento
          </Badge>
        ),
      header: "Status",
    },
    {
      // Timestamp como valor: ordena por data, não pela string "dd/MM/yyyy".
      accessorFn: (product) => parseBrazilianDate(product.createdAt).getTime(),
      cell: ({ row }) =>
        parseBrazilianDate(row.original.createdAt).toLocaleDateString("pt-BR"),
      header: "Cadastrado em",
      id: "createdAt",
    },
    {
      accessorKey: "quantity",
      header: "Qtd",
    },
    {
      accessorKey: "costPrice",
      cell: ({ row }) => formatCurrency(row.original.costPrice),
      header: "Custo de produção",
    },
    {
      accessorKey: "batchFilament",
      cell: ({ row }) => formatWeight(row.original.batchFilament),
      header: "Total de filamento",
    },
    {
      accessorKey: "salePrice",
      cell: ({ row }) => formatCurrency(row.original.salePrice),
      header: "Preço de venda",
    },
    {
      cell: ({ row }) => (
        <ProductRowActions
          onDelete={onDelete}
          onSetProduced={onSetProduced}
          onUpdate={onUpdate}
          product={row.original}
        />
      ),
      header: "Ações",
      id: "actions",
    },
  ];
}
