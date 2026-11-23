"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { buildPrinterModelsColumns } from "@/components/printer-models-columns";
import { PrinterModelsToolbar } from "@/components/printer-models-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrinterModels } from "@/hooks/use-printer-models";

export function PrinterModelsOverview() {
  const {
    createPrinterModel,
    error,
    fetchPrinterModels,
    printerModels,
    isLoading,
    updatePrinterModel,
  } = usePrinterModels();
  const [search, setSearch] = useState("");

  const filteredPrinterModels = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return printerModels;
    }

    return printerModels.filter(
      (model) =>
        model.name.toLowerCase().includes(term) ||
        model.brandName.toLowerCase().includes(term)
    );
  }, [printerModels, search]);

  const columns = useMemo(
    () => buildPrinterModelsColumns(updatePrinterModel),
    [updatePrinterModel]
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PrinterModelsToolbar
        onCreate={createPrinterModel}
        onRefresh={fetchPrinterModels}
        onSearchChange={setSearch}
        search={search}
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {isLoading ? (
        <Skeleton className="min-h-96 w-full flex-1" />
      ) : (
        <DataTable
          columns={columns}
          data={filteredPrinterModels}
          emptyMessage="Nenhum modelo cadastrado."
          pageSize={10}
        />
      )}
    </div>
  );
}
