"use client";

import { BadgeDollarSign, MoreHorizontal } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlanFormDialog } from "@/components/user-plan-form-dialog";
import type { ManagedUser, Plan } from "@/types/plan";

interface UserRowActionsProps {
  onChangePlan: (userId: string, planId: string) => Promise<void>;
  plans: Plan[];
  user: ManagedUser;
}

export function UserRowActions({
  onChangePlan,
  plans,
  user,
}: UserRowActionsProps) {
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);

  const handleOpenPlanDialog = useCallback(() => {
    setIsPlanDialogOpen(true);
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
        </DropdownMenuContent>
      </DropdownMenu>

      <UserPlanFormDialog
        onChangePlan={onChangePlan}
        onOpenChange={setIsPlanDialogOpen}
        open={isPlanDialogOpen}
        plans={plans}
        user={user}
      />
    </>
  );
}
