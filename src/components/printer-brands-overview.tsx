"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { buildPrinterBrandsColumns } from "@/components/printer-brands-columns";
import { PrinterBrandsToolbar } from "@/components/printer-brands-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrinterBrands } from "@/hooks/use-printer-brands";

export function PrinterBrandsOverview() {
  const {
    createPrinterBrand,
    error,
    fetchPrinterBrands,
    printerBrands,
    isLoading,
    updatePrinterBrand,
  } = usePrinterBrands();
  const [search, setSearch] = useState("");

  const filteredPrinterBrands = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return printerBrands;
    }

    return printerBrands.filter((type) =>
      type.name.toLowerCase().includes(term)
    );
  }, [printerBrands, search]);

  const columns = useMemo(
    () => buildPrinterBrandsColumns(updatePrinterBrand),
    [updatePrinterBrand]
  );

  return (
    <div className="flex flex-col gap-4">
      <PrinterBrandsToolbar
        onCreate={createPrinterBrand}
        onRefresh={fetchPrinterBrands}
        onSearchChange={setSearch}
        search={search}
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <DataTable
          columns={columns}
          data={filteredPrinterBrands}
          emptyMessage="Nenhuma marca cadastrada."
          pageSize={10}
        />
      )}
    </div>
  );
}
