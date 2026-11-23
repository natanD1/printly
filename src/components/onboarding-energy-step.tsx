"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { ModalCommunication } from "@/components/modal-communication";
import { NumberField } from "@/components/number-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useSettings } from "@/hooks/use-settings";
import { type SettingsSchema, settingsSchema } from "@/schemas/settings-schema";
import type { ApiErrorResponse } from "@/types/auth";
import type { OnboardingStepProps } from "@/types/onboarding";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  return "Erro inesperado";
}

interface EnergyFormProps extends OnboardingStepProps {
  initialKwhPrice: number;
  onSave: (data: SettingsSchema) => Promise<void>;
}

function EnergyForm({
  initialKwhPrice,
  onBack,
  onDone,
  onSave,
}: EnergyFormProps) {
  const [saveError, setSaveError] = useState<string | null>(null);
  const isSavingRef = useRef<boolean>(false as boolean);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsSchema>({
    defaultValues: { kwhPrice: initialKwhPrice },
    resolver: zodResolver(settingsSchema),
  });

  const submit = handleSubmit(async (data) => {
    if (isSavingRef.current) {
      return;
    }
    isSavingRef.current = true;
    try {
      await onSave(data);
      onDone();
    } catch (caughtError) {
      setSaveError(getErrorMessage(caughtError));
    } finally {
      isSavingRef.current = false;
    }
  });

  const handleErrorOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSaveError(null);
    }
  }, []);

  return (
    <form className="flex flex-col gap-5" onSubmit={submit}>
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-xl">Quanto custa a sua energia?</h2>
        <p className="text-muted-foreground text-sm">
          Usamos o preço do kWh pra calcular o custo de energia de cada
          impressão. Você encontra esse valor na sua conta de luz: procure por
          "tarifa" ou "valor por kWh" (inclua os impostos pra ficar mais
          preciso).
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="kwhPrice">Preço do kWh</Label>
        <NumberField
          control={control}
          decimals={2}
          fixed
          id="kwhPrice"
          name="kwhPrice"
          prefix="R$"
          suffix="/kWh"
        />
        <FieldError message={errors.kwhPrice?.message} />
      </div>

      <div className="flex justify-between gap-2">
        <Button
          disabled={isSubmitting}
          onClick={onBack}
          type="button"
          variant="outline"
        >
          Voltar
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? <Spinner /> : null}
          Avançar
        </Button>
      </div>

      <ModalCommunication
        description={saveError ?? undefined}
        onOpenChange={handleErrorOpenChange}
        open={saveError !== null}
        title="Não foi possível salvar"
        variant="error"
      />
    </form>
  );
}

export function OnboardingEnergyStep(props: OnboardingStepProps) {
  const { error, fetchSettings, settings, updateSettings } = useSettings();

  if (error && !settings) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <FieldError message={error} />
        <Button onClick={fetchSettings} variant="outline">
          Tentar de novo
        </Button>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <EnergyForm
      {...props}
      initialKwhPrice={settings.kwhPrice}
      onSave={updateSettings}
    />
  );
}
