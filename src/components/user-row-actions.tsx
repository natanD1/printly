"use client";

import { BadgeDollarSign, MoreHorizontal, Store } from "lucide-react";
import { useCallback, useState } from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlanFormDialog } from "@/components/user-plan-form-dialog";
import type { ManagedUser, Plan } from "@/types/plan";
import type { AdminShowcase } from "@/types/showcase";

interface UserRowActionsProps {
  onChangePlan: (userId: string, planId: string) => Promise<void>;
  onSetShowcaseBlocked: (id: string, isBlocked: boolean) => Promise<void>;
  plans: Plan[];
  /** Vitrine do usuário, se tiver. */
  showcase?: AdminShowcase;
  user: ManagedUser;
}

export function UserRowActions({
  onChangePlan,
  onSetShowcaseBlocked,
  plans,
  showcase,
  user,
}: UserRowActionsProps) {
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenPlanDialog = useCallback(() => {
    setIsPlanDialogOpen(true);
  }, []);

  const handleToggleBlock = useCallback(async () => {
    if (!showcase) {
      return;
    }

    setIsBlocking(true);
    try {
      await onSetShowcaseBlocked(showcase.id, !showcase.isBlocked);
    } catch (caughtError) {
      setErrorMessage(
        caughtError instanceof Error ? caughtError.message : "Erro inesperado"
      );
    } finally {
      setIsBlocking(false);
    }
  }, [onSetShowcaseBlocked, showcase]);

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
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleOpenPlanDialog}
          >
            <BadgeDollarSign />
            Alterar plano
          </DropdownMenuItem>
          {showcase ? (
            <DropdownMenuItem
              className="cursor-pointer"
              disabled={isBlocking}
              onClick={handleToggleBlock}
            >
              <Store />
              {showcase.isBlocked ? "Desbloquear vitrine" : "Bloquear vitrine"}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <UserPlanFormDialog
        onChangePlan={onChangePlan}
        onOpenChange={setIsPlanDialogOpen}
        open={isPlanDialogOpen}
        plans={plans}
        user={user}
      />

      <ModalCommunication
        description={errorMessage ?? undefined}
        onOpenChange={handleErrorOpenChange}
        open={errorMessage !== null}
        title="Erro ao alterar a vitrine"
        variant="error"
      />
    </>
  );
}
