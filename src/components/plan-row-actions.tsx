"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { PlanFormDialog } from "@/components/plan-form-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Plan, SavePlanPayload } from "@/types/plan";

interface PlanRowActionsProps {
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, payload: SavePlanPayload) => Promise<void>;
  plan: Plan;
}

export function PlanRowActions({
  onDelete,
  onUpdate,
  plan,
}: PlanRowActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenEdit = useCallback(() => {
    setIsEditOpen(true);
  }, []);

  const handleOpenDelete = useCallback(() => {
    setIsDeleteOpen(true);
  }, []);

  const handleEdit = useCallback(
    (payload: SavePlanPayload) => onUpdate(plan.id, payload),
    [onUpdate, plan.id]
  );

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete(plan.id);
      setIsDeleteOpen(false);
    } catch (caughtError) {
      setIsDeleteOpen(false);
      setErrorMessage(
        caughtError instanceof Error ? caughtError.message : "Erro inesperado"
      );
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete, plan.id]);

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
          <DropdownMenuItem
            disabled={plan.isDefault}
            onClick={handleOpenDelete}
            variant="destructive"
          >
            <Trash2 />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PlanFormDialog
        onOpenChange={setIsEditOpen}
        onSubmit={handleEdit}
        open={isEditOpen}
        plan={plan}
      />

      <ModalCommunication
        confirmLabel="Excluir"
        description={`O plano "${plan.name}" será excluído. Essa ação não pode ser desfeita.`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onOpenChange={setIsDeleteOpen}
        open={isDeleteOpen}
        title="Excluir plano?"
        variant="warning"
      />

      <ModalCommunication
        description={errorMessage ?? undefined}
        onOpenChange={handleErrorOpenChange}
        open={errorMessage !== null}
        title="Erro ao excluir plano"
        variant="error"
      />
    </>
  );
}
