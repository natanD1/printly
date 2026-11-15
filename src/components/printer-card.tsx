"use client";

import { Printer3d, Trash2 } from "lucide-react";
import { type MouseEvent, useCallback, useState } from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { PrinterFormDialog } from "@/components/printer-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PrinterSchema } from "@/schemas/printer-schema";
import type { Printer } from "@/types/printer";

interface PrinterCardProps {
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, data: PrinterSchema) => Promise<void>;
  printer: Printer;
}

const numberFormat = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
});

export function PrinterCard({ onDelete, onUpdate, printer }: PrinterCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdate = useCallback(
    (data: PrinterSchema) => onUpdate(printer.id, data),
    [printer.id, onUpdate]
  );

  const handleDeleteTriggerClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setIsDeleteOpen(true);
    },
    []
  );

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete(printer.id);
      setIsDeleteOpen(false);
    } catch (caughtError) {
      setErrorMessage(
        caughtError instanceof Error ? caughtError.message : "Erro inesperado"
      );
    } finally {
      setIsDeleting(false);
    }
  }, [printer.id, onDelete]);

  const handleErrorOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setErrorMessage(null);
    }
  }, []);

  const modelLabel = `${printer.brandName} ${printer.modelName}`.trim();

  return (
    <>
      <PrinterFormDialog
        onSubmit={handleUpdate}
        printer={printer}
        trigger={
          <Card className="group/printer-card cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-start gap-3">
              <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
                {printer.modelImage ? (
                  // biome-ignore lint/performance/noImgElement: preview de base64 vindo da API, sem otimização de imagem aplicável
                  <img
                    alt={modelLabel}
                    className="size-full object-contain"
                    height={64}
                    src={`data:image/png;base64,${printer.modelImage}`}
                    width={64}
                  />
                ) : (
                  <Printer3d className="size-6 text-muted-foreground" />
                )}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate font-medium text-sm">
                      {printer.displayName}
                    </p>
                    {printer.nickname ? (
                      <p className="truncate text-muted-foreground text-xs">
                        {modelLabel}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover/printer-card:opacity-100"
                    onClick={handleDeleteTriggerClick}
                    size="icon-xs"
                    variant="ghost"
                  >
                    <Trash2 className="text-destructive" />
                    <span className="sr-only">Excluir impressora</span>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">
                    {numberFormat.format(printer.averagePowerWatts)} W
                  </Badge>
                  <Badge variant="outline">
                    Margem{" "}
                    {numberFormat.format(printer.defaultProfitMarginPercentage)}
                    %
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        }
        triggerIsNativeButton={false}
      />

      <ModalCommunication
        confirmLabel="Excluir"
        description={`"${printer.displayName}" vai ser removida. Produtos feitos nela mantêm o preço salvo, mas vão pedir outra impressora ao editar.`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onOpenChange={setIsDeleteOpen}
        open={isDeleteOpen}
        title="Excluir impressora?"
        variant="warning"
      />

      <ModalCommunication
        description={errorMessage ?? undefined}
        onOpenChange={handleErrorOpenChange}
        open={errorMessage !== null}
        title="Erro ao excluir impressora"
        variant="error"
      />
    </>
  );
}
