"use client";

import { CircleCheck, Ghost, MoreHorizontal, Pencil } from "lucide-react";
import { useCallback, useState } from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { PrinterModelFormDialog } from "@/components/printer-model-form-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PrinterModelSchema } from "@/schemas/printer-model-schema";
import type { PrinterModel } from "@/types/printer-model";

interface PrinterModelRowActionsProps {
  onUpdate: (
    id: string,
    data: PrinterModelSchema,
    isActive: boolean
  ) => Promise<void>;
  printerModel: PrinterModel;
}

export function PrinterModelRowActions({
  printerModel,
  onUpdate,
}: PrinterModelRowActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenEdit = useCallback(() => {
    setIsEditOpen(true);
  }, []);

  const handleEdit = useCallback(
    (data: PrinterModelSchema) =>
      onUpdate(printerModel.id, data, printerModel.isActive),
    [printerModel.id, printerModel.isActive, onUpdate]
  );

  const handleToggleActive = useCallback(async () => {
    setIsToggling(true);
    try {
      await onUpdate(
        printerModel.id,
        {
          brandId: printerModel.brandId,
          image: null,
          name: printerModel.name,
        },
        !printerModel.isActive
      );
    } catch (caughtError) {
      setErrorMessage(
        caughtError instanceof Error ? caughtError.message : "Erro inesperado"
      );
    } finally {
      setIsToggling(false);
    }
  }, [printerModel, onUpdate]);

  const handleErrorOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setErrorMessage(null);
    }
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon-xs" variant="ghost" />}>
          <span className="sr-only">Abrir ações</span>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={handleOpenEdit}>
            <Pencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isToggling} onClick={handleToggleActive}>
            {printerModel.isActive ? <Ghost /> : <CircleCheck />}
            {printerModel.isActive ? "Desativar" : "Ativar"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PrinterModelFormDialog
        onOpenChange={setIsEditOpen}
        onSubmit={handleEdit}
        open={isEditOpen}
        printerModel={printerModel}
      />

      <ModalCommunication
        description={errorMessage ?? undefined}
        onOpenChange={handleErrorOpenChange}
        open={errorMessage !== null}
        title="Erro ao atualizar modelo"
        variant="error"
      />
    </>
  );
}
