"use client";

import { type ReactElement, useCallback, useState } from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { PrinterBrandForm } from "@/components/printer-brand-form";
import { SideSheetContent } from "@/components/side-sheet";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import type { PrinterBrandSchema } from "@/schemas/printer-brand-schema";
import type { PrinterBrand } from "@/types/printer-brand";

interface ResultModalState {
  description?: string;
  title: string;
  variant: "success" | "error";
}

interface PrinterBrandFormDialogProps {
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: PrinterBrandSchema) => Promise<void>;
  open?: boolean;
  printerBrand?: PrinterBrand;
  trigger?: ReactElement;
  triggerIsNativeButton?: boolean;
}

export function PrinterBrandFormDialog({
  printerBrand,
  onOpenChange,
  onSubmit,
  open: controlledOpen,
  trigger,
  triggerIsNativeButton = true,
}: PrinterBrandFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [resultModal, setResultModal] = useState<ResultModalState | null>(null);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled
    ? (onOpenChange ?? (() => undefined))
    : setInternalOpen;
  const isEditing = Boolean(printerBrand);

  const handleSubmit = useCallback(
    async (data: PrinterBrandSchema) => {
      try {
        await onSubmit(data);
        setOpen(false);
        setResultModal({
          description: isEditing
            ? `"${data.name}" foi atualizada com sucesso.`
            : `"${data.name}" foi cadastrada.`,
          title: isEditing ? "Marca atualizada" : "Marca cadastrada",
          variant: "success",
        });
      } catch (caughtError) {
        setResultModal({
          description:
            caughtError instanceof Error
              ? caughtError.message
              : "Tente novamente em alguns instantes.",
          title: "Erro ao salvar marca",
          variant: "error",
        });
      }
    },
    [onSubmit, setOpen, isEditing]
  );

  const handleResultOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setResultModal(null);
    }
  }, []);

  return (
    <>
      <Sheet onOpenChange={setOpen} open={open}>
        {trigger ? (
          <SheetTrigger nativeButton={triggerIsNativeButton} render={trigger} />
        ) : null}
        <SideSheetContent
          title={isEditing ? "Editar marca" : "Adicionar marca"}
        >
          <PrinterBrandForm
            defaultValues={
              printerBrand ? { name: printerBrand.name } : undefined
            }
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
