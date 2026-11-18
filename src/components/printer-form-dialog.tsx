"use client";

import { type ReactElement, useCallback, useState } from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { PrinterForm } from "@/components/printer-form";
import { SideSheetContent } from "@/components/side-sheet";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import type { PrinterSchema } from "@/schemas/printer-schema";
import type { Printer } from "@/types/printer";

interface ResultModalState {
  description?: string;
  title: string;
  variant: "success" | "error";
}

interface PrinterFormDialogProps {
  onSubmit: (data: PrinterSchema) => Promise<void>;
  printer?: Printer;
  trigger: ReactElement;
  triggerIsNativeButton?: boolean;
}

function toFormValues(printer: Printer): PrinterSchema {
  return {
    averagePowerWatts: printer.averagePowerWatts,
    brandId: printer.brandId,
    defaultProfitMarginPercentage: printer.defaultProfitMarginPercentage,
    depreciationEnabled: printer.depreciationEnabled,
    failureEnabled: printer.failureEnabled,
    failureRatePercentage: printer.failureRatePercentage,
    maintenanceEnabled: printer.maintenanceEnabled,
    maintenancePercentage: printer.maintenancePercentage,
    nickname: printer.nickname ?? "",
    printerLifespanHours: printer.printerLifespanHours,
    printerModelId: printer.printerModelId,
    printerValue: printer.printerValue,
  };
}

export function PrinterFormDialog({
  onSubmit,
  printer,
  trigger,
  triggerIsNativeButton = true,
}: PrinterFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [resultModal, setResultModal] = useState<ResultModalState | null>(null);
  const isEditing = Boolean(printer);

  const handleSubmit = useCallback(
    async (data: PrinterSchema) => {
      try {
        await onSubmit(data);
        setOpen(false);
        setResultModal({
          description: isEditing
            ? "Os novos custos valem para os próximos produtos salvos com ela."
            : "Já dá pra escolher ela ao cadastrar um produto.",
          title: isEditing ? "Impressora atualizada" : "Impressora cadastrada",
          variant: "success",
        });
      } catch (caughtError) {
        setResultModal({
          description:
            caughtError instanceof Error
              ? caughtError.message
              : "Tente novamente em alguns instantes.",
          title: "Erro ao salvar impressora",
          variant: "error",
        });
      }
    },
    [onSubmit, isEditing]
  );

  const handleResultOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setResultModal(null);
    }
  }, []);

  return (
    <>
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetTrigger nativeButton={triggerIsNativeButton} render={trigger} />
        <SideSheetContent
          size="wide"
          title={isEditing ? "Editar impressora" : "Adicionar impressora"}
        >
          <PrinterForm
            defaultValues={printer ? toFormValues(printer) : undefined}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? "Salvar" : "Adicionar"}
          />
        </SideSheetContent>
      </Sheet>

      <ModalCommunication
        description={resultModal?.description}
        onOpenChange={handleResultOpenChange}
        open={resultModal !== null}
        title={resultModal?.title ?? ""}
        variant={resultModal?.variant ?? "success"}
      />
    </>
  );
}
