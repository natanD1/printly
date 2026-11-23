"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AvailablePlan } from "@/types/plan";

interface PlanCtaButtonProps {
  isCurrent: boolean;
  plan: AvailablePlan;
}

// Ponto único onde o futuro gateway de pagamento será conectado.
export function PlanCtaButton({ isCurrent, plan }: PlanCtaButtonProps) {
  if (isCurrent) {
    return (
      <Button
        className="w-full"
        data-plan-id={plan.id}
        disabled
        size="lg"
        variant="secondary"
      >
        <Check aria-hidden="true" />
        Plano atual
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        className="inline-flex w-full rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        render={<span />}
        tabIndex={0}
      >
        <Button
          className="w-full"
          data-plan-id={plan.id}
          disabled
          size="lg"
          variant="outline"
        >
          Em breve
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        A assinatura online ainda não está disponível. Fale com o suporte para
        mudar de plano.
      </TooltipContent>
    </Tooltip>
  );
}
