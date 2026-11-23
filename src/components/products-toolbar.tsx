"use client";

import { Plus, RefreshCw, Search } from "lucide-react";
import { type ChangeEvent, useCallback } from "react";
import { ProductFormDialog } from "@/components/product-form-dialog";
import { ProductsPeriodFilter } from "@/components/products-period-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UpgradeNotice } from "@/components/upgrade-notice";
import { useEntitlement } from "@/hooks/use-entitlement";
import type { ProductSchema } from "@/schemas/product-schema";
import type { DateRange } from "@/utils/date-filters";

interface ProductsToolbarProps {
  /** Meses anteriores ao atual que o plano deixa consultar (`null` = sem limite). */
  monthsBack: number | null;
  onCreate: (data: ProductSchema) => Promise<void>;
  onRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
  range: DateRange;
  search: string;
}

export function ProductsToolbar({
  monthsBack,
  onCreate,
  onRangeChange,
  onRefresh,
  onSearchChange,
  range,
  search,
}: ProductsToolbarProps) {
  const { canCreate, limit } = useEntitlement("MaxProductsPerMonth");

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onSearchChange(event.target.value);
    },
    [onSearchChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            onChange={handleSearchChange}
            placeholder="Buscar produto..."
            value={search}
          />
        </div>

        <div className="flex items-center gap-2">
          <ProductsPeriodFilter
            monthsBack={monthsBack}
            onChange={onRangeChange}
            value={range}
          />
          <Button onClick={onRefresh} size="lg" variant="outline">
            <RefreshCw />
            Atualizar
          </Button>
          <ProductFormDialog
            onSubmit={onCreate}
            trigger={
              <Button disabled={!canCreate} size="lg">
                <Plus />
                Adicionar produto
              </Button>
            }
          />
        </div>
      </div>

      {canCreate ? null : (
        <UpgradeNotice
          message={`Seu plano permite até ${limit} ${limit === 1 ? "produto" : "produtos"} por mês. Fale com o suporte para mudar de plano.`}
        />
      )}
    </div>
  );
}
