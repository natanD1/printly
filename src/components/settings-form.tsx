"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Wrench, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { type Control, useForm } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { NumberField } from "@/components/number-field";
import { SwitchField } from "@/components/switch-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { type SettingsSchema, settingsSchema } from "@/schemas/settings-schema";
import type { Settings } from "@/types/settings";

interface SettingsFormProps {
  onSubmit: (data: SettingsSchema) => Promise<void>;
  settings: Settings;
}

type ToggleName =
  | "depreciationEnabled"
  | "failureEnabled"
  | "maintenanceEnabled";

interface OptionalCostProps {
  children: ReactNode;
  control: Control<SettingsSchema>;
  description: string;
  disabled?: boolean;
  title: string;
  toggle: ToggleName;
}

function OptionalCost({
  children,
  control,
  description,
  disabled,
  title,
  toggle,
}: OptionalCostProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{title}</span>
          <span className="text-muted-foreground text-xs">{description}</span>
        </div>
        <SwitchField
          aria-label={title}
          control={control}
          disabled={disabled}
          name={toggle}
        />
      </div>
      {children}
    </div>
  );
}

export function SettingsForm({ onSubmit, settings }: SettingsFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsSchema>({
    defaultValues: {
      averagePowerWatts: settings.averagePowerWatts,
      defaultProfitMarginPercentage: settings.defaultProfitMarginPercentage,
      depreciationEnabled: settings.depreciationEnabled,
      failureEnabled: settings.failureEnabled,
      failureRatePercentage: settings.failureRatePercentage,
      kwhPrice: settings.kwhPrice,
      maintenanceEnabled: settings.maintenanceEnabled,
      maintenancePercentage: settings.maintenancePercentage,
      printerLifespanHours: settings.printerLifespanHours,
      printerValue: settings.printerValue,
    },
    resolver: zodResolver(settingsSchema),
  });

  const depreciationEnabled = watch("depreciationEnabled");
  const maintenanceEnabled = watch("maintenanceEnabled");
  const failureEnabled = watch("failureEnabled");

  const submit = handleSubmit(onSubmit);

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-4 text-amber-500 dark:text-amber-400" />
            Produção
          </CardTitle>
          <CardDescription>
            Usado pra calcular custo de energia e preço de venda sugerido
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="averagePowerWatts">Potência média</Label>
            <NumberField
              control={control}
              decimals={2}
              id="averagePowerWatts"
              name="averagePowerWatts"
              suffix="W"
            />
            <FieldError message={errors.averagePowerWatts?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="defaultProfitMarginPercentage">
              Margem de lucro
            </Label>
            <NumberField
              control={control}
              decimals={2}
              id="defaultProfitMarginPercentage"
              name="defaultProfitMarginPercentage"
              suffix="%"
            />
            <FieldError
              message={errors.defaultProfitMarginPercentage?.message}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="size-4 text-sky-500 dark:text-sky-400" />
            Custos opcionais
          </CardTitle>
          <CardDescription>
            Ligue só o que quiser somar ao custo real de cada produto
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <OptionalCost
            control={control}
            description="Desgaste da impressora a cada hora impressa"
            title="Depreciação"
            toggle="depreciationEnabled"
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="printerValue">Valor da impressora</Label>
                <NumberField
                  control={control}
                  decimals={2}
                  disabled={!depreciationEnabled}
                  fixed
                  id="printerValue"
                  name="printerValue"
                  prefix="R$"
                />
                <FieldError message={errors.printerValue?.message} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="printerLifespanHours">Vida útil</Label>
                <NumberField
                  control={control}
                  disabled={!depreciationEnabled}
                  id="printerLifespanHours"
                  name="printerLifespanHours"
                  suffix="h"
                />
                <FieldError message={errors.printerLifespanHours?.message} />
              </div>
            </div>
          </OptionalCost>

          <Separator />

          <OptionalCost
            control={control}
            description="Percentual sobre a depreciação (precisa dela ligada)"
            disabled={!depreciationEnabled}
            title="Manutenção"
            toggle="maintenanceEnabled"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="maintenancePercentage">
                Percentual de manutenção
              </Label>
              <NumberField
                control={control}
                decimals={2}
                disabled={!(depreciationEnabled && maintenanceEnabled)}
                id="maintenancePercentage"
                name="maintenancePercentage"
                suffix="%"
              />
              <FieldError message={errors.maintenancePercentage?.message} />
            </div>
          </OptionalCost>

          <Separator />

          <OptionalCost
            control={control}
            description="Reserva pra peças que falham e precisam ser refeitas"
            title="Perda por falha"
            toggle="failureEnabled"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="failureRatePercentage">Taxa de falha</Label>
              <NumberField
                control={control}
                decimals={2}
                disabled={!failureEnabled}
                id="failureRatePercentage"
                max={100}
                name="failureRatePercentage"
                suffix="%"
              />
              <FieldError message={errors.failureRatePercentage?.message} />
            </div>
          </OptionalCost>
        </CardContent>
      </Card>

      <Button className="w-fit" disabled={isSubmitting} type="submit">
        Salvar
      </Button>
    </form>
  );
}
