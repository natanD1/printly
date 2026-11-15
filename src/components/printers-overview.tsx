"use client";

import { Plus, Printer3d, RefreshCw } from "lucide-react";
import { PrinterCard } from "@/components/printer-card";
import { PrinterFormDialog } from "@/components/printer-form-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrinters } from "@/hooks/use-printers";

const SKELETON_KEYS = ["skeleton-1", "skeleton-2", "skeleton-3"];

export function PrintersOverview() {
  const {
    createPrinter,
    deletePrinter,
    error,
    fetchPrinters,
    isLoading,
    printers,
    updatePrinter,
  } = usePrinters();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Cada impressora tem seus próprios custos. O preço de um produto é
          calculado com a impressora escolhida nele.
        </p>
        <div className="flex items-center gap-2">
          <Button onClick={fetchPrinters} size="lg" variant="outline">
            <RefreshCw />
            Atualizar
          </Button>
          <PrinterFormDialog
            onSubmit={createPrinter}
            trigger={
              <Button size="lg">
                <Plus />
                Adicionar impressora
              </Button>
            }
          />
        </div>
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKELETON_KEYS.map((key) => (
            <Skeleton className="h-24 w-full" key={key} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {printers.length ? (
            printers.map((printer) => (
              <PrinterCard
                key={printer.id}
                onDelete={deletePrinter}
                onUpdate={updatePrinter}
                printer={printer}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground text-sm">
              <Printer3d className="mx-auto mb-2 size-8" />
              Nenhuma impressora cadastrada.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
