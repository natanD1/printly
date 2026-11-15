"use client";

import { CircleCheck, Ghost, MoreHorizontal, Pencil } from "lucide-react";
import { useCallback, useState } from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { PrinterBrandFormDialog } from "@/components/printer-brand-form-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PrinterBrandSchema } from "@/schemas/printer-brand-schema";
import type { PrinterBrand } from "@/types/printer-brand";

interface PrinterBrandRowActionsProps {
  onUpdate: (
    id: string,
    data: PrinterBrandSchema,
    isActive: boolean
  ) => Promise<void>;
  printerBrand: PrinterBrand;
}

export function PrinterBrandRowActions({
  printerBrand,
  onUpdate,
}: PrinterBrandRowActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenEdit = useCallback(() => {
    setIsEditOpen(true);
  }, []);

  const handleEdit = useCallback(
    (data: PrinterBrandSchema) =>
      onUpdate(printerBrand.id, data, printerBrand.isActive),
    [printerBrand.id, printerBrand.isActive, onUpdate]
  );

  const handleToggleActive = useCallback(async () => {
    setIsToggling(true);
    try {
      await onUpdate(
        printerBrand.id,
        { name: printerBrand.name },
        !printerBrand.isActive
      );
    } catch (caughtError) {
      setErrorMessage(
        caughtError instanceof Error ? caughtError.message : "Erro inesperado"
      );
    } finally {
      setIsToggling(false);
    }
  }, [printerBrand, onUpdate]);

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
            {printerBrand.isActive ? <Ghost /> : <CircleCheck />}
            {printerBrand.isActive ? "Desativar" : "Ativar"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PrinterBrandFormDialog
        onOpenChange={setIsEditOpen}
        onSubmit={handleEdit}
        open={isEditOpen}
        printerBrand={printerBrand}
      />

      <ModalCommunication
        description={errorMessage ?? undefined}
        onOpenChange={handleErrorOpenChange}
        open={errorMessage !== null}
        title="Erro ao atualizar marca"
        variant="error"
      />
    </>
  );
}
