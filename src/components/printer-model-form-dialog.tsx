"use client";

import { type ReactElement, useCallback, useState } from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { PrinterModelForm } from "@/components/printer-model-form";
import { SideSheetContent } from "@/components/side-sheet";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import type { PrinterModelSchema } from "@/schemas/printer-model-schema";
import type { PrinterModel } from "@/types/printer-model";

interface ResultModalState {
  description?: string;
  title: string;
  variant: "success" | "error";
}

interface PrinterModelFormDialogProps {
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: PrinterModelSchema) => Promise<void>;
  open?: boolean;
  printerModel?: PrinterModel;
  trigger?: ReactElement;
  triggerIsNativeButton?: boolean;
}

export function PrinterModelFormDialog({
  printerModel,
  onOpenChange,
  onSubmit,
  open: controlledOpen,
  trigger,
  triggerIsNativeButton = true,
}: PrinterModelFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [resultModal, setResultModal] = useState<ResultModalState | null>(null);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled
    ? (onOpenChange ?? (() => undefined))
    : setInternalOpen;
  const isEditing = Boolean(printerModel);

  const handleSubmit = useCallback(
    async (data: PrinterModelSchema) => {
      try {
        await onSubmit(data);
        setOpen(false);
        setResultModal({
          description: isEditing
            ? `"${data.name}" foi atualizado com sucesso.`
            : `"${data.name}" foi cadastrado.`,
          title: isEditing ? "Modelo atualizado" : "Modelo cadastrado",
          variant: "success",
        });
      } catch (caughtError) {
        setResultModal({
          description:
            caughtError instanceof Error
              ? caughtError.message
              : "Tente novamente em alguns instantes.",
          title: "Erro ao salvar modelo",
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
          title={isEditing ? "Editar modelo" : "Adicionar modelo"}
        >
          <PrinterModelForm
            defaultValues={
              printerModel
                ? {
                    brandId: printerModel.brandId,
                    image: null,
                    name: printerModel.name,
                  }
                : undefined
            }
            existingImagePreview={printerModel?.image}
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
