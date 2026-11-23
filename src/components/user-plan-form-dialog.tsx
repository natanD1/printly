"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { OptionChips } from "@/components/option-chips";
import { SideSheetActions, SideSheetContent } from "@/components/side-sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetClose } from "@/components/ui/sheet";
import type { ManagedUser, Plan } from "@/types/plan";
import { formatCurrency } from "@/utils/format-currency";

interface UserPlanFormDialogProps {
  onChangePlan: (userId: string, planId: string) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  plans: Plan[];
  user: ManagedUser;
}

function formatPlanOptionLabel(plan: Plan): string {
  if (plan.monthlyPrice === 0) {
    return `${plan.name} · Grátis`;
  }

  return `${plan.name} · ${formatCurrency(plan.monthlyPrice)}/mês`;
}

export function UserPlanFormDialog({
  onChangePlan,
  onOpenChange,
  open,
  plans,
  user,
}: UserPlanFormDialogProps) {
  const [selectedPlanId, setSelectedPlanId] = useState(user.planId);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedPlanId(user.planId);
    }
  }, [open, user.planId]);

  const activePlanOptions = useMemo(
    () =>
      plans
        // Inativos somem da escolha, mas o plano atual continua visível (o backend não deixa atribuir inativo).
        .filter((plan) => plan.isActive || plan.id === user.planId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((plan) => ({
          id: plan.id,
          label: plan.isActive
            ? formatPlanOptionLabel(plan)
            : `${formatPlanOptionLabel(plan)} (inativo)`,
        })),
    [plans, user.planId]
  );

  const isUnchanged = !selectedPlanId || selectedPlanId === user.planId;

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!selectedPlanId || selectedPlanId === user.planId) {
        return;
      }

      setIsSaving(true);
      try {
        await onChangePlan(user.id, selectedPlanId);
        onOpenChange(false);
      } catch (caughtError) {
        setErrorMessage(
          caughtError instanceof Error
            ? caughtError.message
            : "Tente novamente em alguns instantes."
        );
      } finally {
        setIsSaving(false);
      }
    },
    [onChangePlan, onOpenChange, selectedPlanId, user.id, user.planId]
  );

  const handleErrorOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setErrorMessage(null);
    }
  }, []);

  return (
    <>
      <Sheet onOpenChange={onOpenChange} open={open}>
        <SideSheetContent title="Alterar plano">
          <form className="flex flex-1 flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-0.5 rounded-lg border bg-muted/50 px-3 py-2.5">
              <span className="font-medium text-sm">{user.name}</span>
              <span className="text-muted-foreground text-xs">
                {user.email}
              </span>
            </div>

            {user.isAdmin ? (
              <p className="rounded-lg border bg-muted/50 px-3 py-2 text-muted-foreground text-xs">
                Este usuário é administrador e não tem limites, mas o plano pode
                ser alterado normalmente.
              </p>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label>Plano</Label>
              <OptionChips
                className="grid-cols-1 sm:grid-cols-1"
                emptyMessage="Nenhum plano ativo disponível."
                onSelect={setSelectedPlanId}
                options={activePlanOptions}
                value={selectedPlanId}
              />
            </div>

            <SideSheetActions>
              <SheetClose render={<Button type="button" variant="outline" />}>
                Cancelar
              </SheetClose>
              <Button disabled={isSaving || isUnchanged} type="submit">
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </SideSheetActions>
          </form>
        </SideSheetContent>
      </Sheet>

      <ModalCommunication
        description={errorMessage ?? undefined}
        onOpenChange={handleErrorOpenChange}
        open={errorMessage !== null}
        title="Erro ao alterar plano"
        variant="error"
      />
    </>
  );
}
