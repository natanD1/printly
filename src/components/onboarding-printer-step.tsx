"use client";

import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { PrinterForm } from "@/components/printer-form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEntitlement } from "@/hooks/use-entitlement";
import { usePrinterBrands } from "@/hooks/use-printer-brands";
import { usePrinterModels } from "@/hooks/use-printer-models";
import { usePrinters } from "@/hooks/use-printers";
import type { PrinterSchema } from "@/schemas/printer-schema";
import type { OnboardingStepProps } from "@/types/onboarding";
import type { Printer } from "@/types/printer";

function toFormValues(printer: Printer): PrinterSchema {
  return {
    averagePowerWatts: printer.averagePowerWatts,
    brandId: printer.brandId,
    defaultProfitMarginPercentage: printer.defaultProfitMarginPercentage,
    depreciationEnabled: printer.depreciationEnabled,
    failureEnabled: printer.failureEnabled,
    failureRatePercentage: printer.failureRatePercentage,
    maintenanceEnabled: printer.maintenanceEnabled,
    maintenancePercentage: printer.maintenancePercentage,
    nickname: printer.nickname ?? "",
    printerLifespanHours: printer.printerLifespanHours,
    printerModelId: printer.printerModelId,
    printerValue: printer.printerValue,
  };
}

interface EmptyPrinterCatalogProps {
  message: string;
  onBack?: () => void;
  onSkip: () => void;
}

const EMPTY_CATALOG_MESSAGE =
  "Ainda não há impressoras no catálogo. Você pode pular esta etapa e cadastrar sua impressora depois, em Impressoras.";

// Plano padrão com MaxPrinters = 0 (ou já no limite): sem "Pular" o usuário novo ficaria preso nesta etapa.
const PLAN_LIMIT_MESSAGE =
  "Seu plano não permite cadastrar mais impressoras. Você pode pular esta etapa e continuar.";

function EmptyPrinterCatalog({
  message,
  onBack,
  onSkip,
}: EmptyPrinterCatalogProps) {
  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-lg border bg-muted/40 p-4 text-muted-foreground text-sm">
        {message}
      </p>
      <div className="flex w-full items-center justify-between gap-3 border-t pt-4">
        {onBack ? (
          <Button onClick={onBack} type="button" variant="outline">
            Voltar
          </Button>
        ) : null}
        <Button
          className={onBack ? undefined : "ml-auto"}
          onClick={onSkip}
          type="button"
        >
          Pular
        </Button>
      </div>
    </div>
  );
}

export function OnboardingPrinterStep({
  onBack,
  onDone,
  onSkip,
}: OnboardingStepProps) {
  const {
    createPrinter,
    isLoading: isPrintersLoading,
    printers,
    updatePrinter,
  } = usePrinters();
  const { isLoading: isBrandsLoading, printerBrands } = usePrinterBrands();
  const { isLoading: isModelsLoading, printerModels } = usePrinterModels();
  const { canCreate: canCreatePrinter } = useEntitlement("MaxPrinters");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSubmittingRef = useRef<boolean>(false as boolean);

  const [existingPrinter] = printers;
  const isInitialLoading =
    isPrintersLoading || isBrandsLoading || isModelsLoading;

  const defaultValues = useMemo(
    () => (existingPrinter ? toFormValues(existingPrinter) : undefined),
    [existingPrinter]
  );

  const hasActiveCatalog = useMemo(() => {
    const activeBrandIds = new Set(
      printerBrands.filter((brand) => brand.isActive).map((brand) => brand.id)
    );
    return printerModels.some(
      (model) => model.isActive && activeBrandIds.has(model.brandId)
    );
  }, [printerBrands, printerModels]);

  const handleSubmit = useCallback(
    async (data: PrinterSchema) => {
      if (isSubmittingRef.current) {
        return;
      }
      isSubmittingRef.current = true;
      try {
        if (existingPrinter) {
          await updatePrinter(existingPrinter.id, data);
        } else {
          await createPrinter(data);
        }
        onDone();
      } catch (caughtError) {
        setErrorMessage(
          caughtError instanceof Error
            ? caughtError.message
            : "Tente novamente em alguns instantes."
        );
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [createPrinter, existingPrinter, onDone, updatePrinter]
  );

  const handleSkip = useCallback(() => {
    const action = onSkip ?? onDone;
    action();
  }, [onDone, onSkip]);

  const handleErrorOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setErrorMessage(null);
    }
  }, []);

  const renderActions = useCallback(
    ({ isSubmitting }: { isSubmitting: boolean }) => (
      <div className="flex w-full items-center justify-between gap-3 border-t pt-4">
        {onBack ? (
          <Button
            disabled={isSubmitting}
            onClick={onBack}
            type="button"
            variant="outline"
          >
            Voltar
          </Button>
        ) : null}
        <Button
          className={onBack ? undefined : "ml-auto"}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? <Spinner /> : null}
          Avançar
        </Button>
      </div>
    ),
    [onBack]
  );

  let content: ReactNode;
  if (isInitialLoading) {
    content = (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  } else if (!(existingPrinter || canCreatePrinter)) {
    content = (
      <EmptyPrinterCatalog
        message={PLAN_LIMIT_MESSAGE}
        onBack={onBack}
        onSkip={handleSkip}
      />
    );
  } else if (hasActiveCatalog) {
    content = (
      <PrinterForm
        defaultValues={defaultValues}
        key={existingPrinter?.id ?? "new"}
        onSubmit={handleSubmit}
        renderActions={renderActions}
        submitLabel="Avançar"
      />
    );
  } else {
    content = (
      <EmptyPrinterCatalog
        message={EMPTY_CATALOG_MESSAGE}
        onBack={onBack}
        onSkip={handleSkip}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-xl tracking-tight">Sua impressora</h2>
        <p className="text-muted-foreground text-sm">
          Cadastre a impressora que você usa para calcular custos de energia,
          depreciação e margem nos seus produtos.
        </p>
      </div>

      {content}

      <ModalCommunication
        description={errorMessage ?? undefined}
        onOpenChange={handleErrorOpenChange}
        open={errorMessage !== null}
        title="Não foi possível salvar a impressora"
        variant="error"
      />
    </div>
  );
}
