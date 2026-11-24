"use client";

import { BrushCleaning } from "lucide-react";
import { useMemo, useState } from "react";
import { FilamentCard } from "@/components/filament-card";
import { FilamentsToolbar } from "@/components/filaments-toolbar";
import { TotalFilamentUsedIndicator } from "@/components/total-filament-used-indicator";
import { TotalFilamentWeightIndicator } from "@/components/total-filament-weight-indicator";
import { TotalFilamentsCountIndicator } from "@/components/total-filaments-count-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilaments } from "@/hooks/use-filaments";
import { useProducts } from "@/hooks/use-products";
import { currentMonthRange, isSameMonth } from "@/utils/date-filters";

const SKELETON_KEYS = [
  "skeleton-1",
  "skeleton-2",
  "skeleton-3",
  "skeleton-4",
  "skeleton-5",
  "skeleton-6",
];

export function FilamentsOverview() {
  const {
    createFilament,
    deleteFilament,
    error,
    fetchFilaments,
    filaments,
    isLoading,
    updateFilament,
  } = useFilaments();
  const [currentMonth] = useState(currentMonthRange);
  const { products } = useProducts(currentMonth);
  const [search, setSearch] = useState("");

  const filteredFilaments = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return filaments;
    }

    return filaments.filter(
      (filament) =>
        filament.name.toLowerCase().includes(term) ||
        filament.brand.nameBrand.toLowerCase().includes(term)
    );
  }, [filaments, search]);

  const totalWeightKg = useMemo(
    () => filaments.reduce((total, filament) => total + filament.weight, 0),
    [filaments]
  );

  const usedThisMonthGrams = useMemo(() => {
    const now = new Date();

    return products
      .filter((product) => isSameMonth(product.createdAt, now))
      .reduce((total, product) => total + product.batchFilament, 0);
  }, [products]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TotalFilamentsCountIndicator count={filaments.length} />
        <TotalFilamentWeightIndicator kilograms={totalWeightKg} />
        <TotalFilamentUsedIndicator grams={usedThisMonthGrams} />
      </div>
      <FilamentsToolbar
        onCreate={createFilament}
        onRefresh={fetchFilaments}
        onSearchChange={setSearch}
        search={search}
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKELETON_KEYS.map((key) => (
            <Skeleton className="h-20 w-full" key={key} />
          ))}
        </div>
      ) : null}

      {!isLoading && filteredFilaments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFilaments.map((filament) => (
            <FilamentCard
              filament={filament}
              key={filament.id}
              onDelete={deleteFilament}
              onUpdate={updateFilament}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && filteredFilaments.length === 0 ? (
        <div className="flex min-h-64 flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
          <BrushCleaning aria-hidden="true" className="size-8" />
          <p className="text-sm">Nenhum filamento cadastrado.</p>
        </div>
      ) : null}
    </div>
  );
}
