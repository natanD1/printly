"use client";

import { type ReactElement, useCallback, useState } from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { PlanForm } from "@/components/plan-form";
import { SideSheetContent } from "@/components/side-sheet";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import type { Plan, SavePlanPayload } from "@/types/plan";

interface ResultModalState {
  description?: string;
  title: string;
  variant: "success" | "error";
}

interface PlanFormDialogProps {
  onOpenChange?: (open: boolean) => void;
  onSubmit: (payload: SavePlanPayload) => Promise<void>;
  open?: boolean;
  plan?: Plan;
  trigger?: ReactElement;
  triggerIsNativeButton?: boolean;
}

export function PlanFormDialog({
  onOpenChange,
  onSubmit,
  open: controlledOpen,
  plan,
  trigger,
  triggerIsNativeButton = true,
}: PlanFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [resultModal, setResultModal] = useState<ResultModalState | null>(null);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled
    ? (onOpenChange ?? (() => undefined))
    : setInternalOpen;
  const isEditing = Boolean(plan);

  const handleSubmit = useCallback(
    async (payload: SavePlanPayload) => {
      try {
        await onSubmit(payload);
        setOpen(false);
        setResultModal({
          description: isEditing
            ? `"${payload.name}" foi atualizado com sucesso.`
            : `"${payload.name}" foi criado.`,
          title: isEditing ? "Plano atualizado" : "Plano criado",
          variant: "success",
        });
      } catch (caughtError) {
        setResultModal({
          description:
            caughtError instanceof Error
              ? caughtError.message
              : "Tente novamente em alguns instantes.",
          title: "Erro ao salvar plano",
          variant: "error",
        });
      }
    },
    [isEditing, onSubmit, setOpen]
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
          size="wide"
          title={isEditing ? "Editar plano" : "Novo plano"}
        >
          <PlanForm
            onSubmit={handleSubmit}
            plan={plan}
            submitLabel={isEditing ? "Salvar" : "Criar plano"}
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
