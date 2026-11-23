"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { NumberField } from "@/components/number-field";
import { OptionCardPicker } from "@/components/option-card-picker";
import { OptionalCost } from "@/components/optional-cost";
import { SideSheetActions } from "@/components/side-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SheetClose } from "@/components/ui/sheet";
import { UpgradeNotice } from "@/components/upgrade-notice";
import { useEntitlement } from "@/hooks/use-entitlement";
import { usePrinterBrands } from "@/hooks/use-printer-brands";
import { usePrinterModels } from "@/hooks/use-printer-models";
import { type PrinterSchema, printerSchema } from "@/schemas/printer-schema";

interface PrinterFormProps {
  defaultValues?: PrinterSchema;
  onSubmit: (data: PrinterSchema) => Promise<void>;
  renderActions?: (state: { isSubmitting: boolean }) => ReactNode;
  submitLabel: string;
}

const EMPTY_VALUES: PrinterSchema = {
  averagePowerWatts: 150,
  brandId: "",
  defaultProfitMarginPercentage: 50,
  depreciationEnabled: false,
  failureEnabled: false,
  failureRatePercentage: 5,
  maintenanceEnabled: false,
  maintenancePercentage: 10,
  nickname: "",
  printerLifespanHours: 2000,
  printerModelId: "",
  printerValue: 0,
};

export function PrinterForm({
  defaultValues,
  onSubmit,
  renderActions,
  submitLabel,
}: PrinterFormProps) {
  const { printerBrands } = usePrinterBrands();
  const { printerModels } = usePrinterModels();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PrinterSchema>({
    defaultValues: defaultValues ?? EMPTY_VALUES,
    resolver: zodResolver(printerSchema),
  });

  const brandId = watch("brandId");
  const printerModelId = watch("printerModelId");
  const depreciationEnabled = watch("depreciationEnabled");
  const maintenanceEnabled = watch("maintenanceEnabled");
  const failureEnabled = watch("failureEnabled");

  const submit = handleSubmit(onSubmit);

  // Sem o recurso no plano, só bloqueia LIGAR: custo ligado (salvo ou ligado antes do plano carregar)
  // sempre pode ser desligado; religar só se já estava ligado no valor salvo (o backend aceita).
  const { enabled: optionalCostsEnabled } = useEntitlement(
    "OptionalCostsEnabled"
  );
  const isDepreciationLocked = !(
    optionalCostsEnabled ||
    defaultValues?.depreciationEnabled ||
    depreciationEnabled
  );
  const isMaintenanceLocked = !(
    optionalCostsEnabled ||
    defaultValues?.maintenanceEnabled ||
    maintenanceEnabled
  );
  const isFailureLocked = !(
    optionalCostsEnabled ||
    defaultValues?.failureEnabled ||
    failureEnabled
  );

  // Inativos somem da escolha, mas o já selecionado continua visível na edição.
  const brandOptions = useMemo(
    () =>
      printerBrands
        .filter((brand) => brand.isActive || brand.id === brandId)
        .map((brand) => ({ id: brand.id, label: brand.name })),
    [brandId, printerBrands]
  );

  const modelOptions = useMemo(
    () =>
      printerModels
        .filter(
          (model) =>
            model.brandId === brandId &&
            (model.isActive || model.id === printerModelId)
        )
        .map((model) => ({
          id: model.id,
          image: model.image,
          label: model.name,
        })),
    [brandId, printerModelId, printerModels]
  );

  const handleSelectBrand = useCallback(
    (id: string) => {
      if (id === brandId) {
        return;
      }
      setValue("brandId", id, { shouldValidate: true });
      // Modelo pertence à marca: trocar a marca invalida a escolha anterior.
      setValue("printerModelId", "");
    },
    [brandId, setValue]
  );

  const handleSelectModel = useCallback(
    (id: string) => setValue("printerModelId", id, { shouldValidate: true }),
    [setValue]
  );

  return (
    <form className="flex flex-1 flex-col gap-4" onSubmit={submit}>
      <div className="flex flex-col gap-1.5">
        <OptionCardPicker
          emptyMessage="Nenhuma marca de impressora disponível."
          emptySearchMessage="Nenhuma marca encontrada."
          label="Marca"
          onSelect={handleSelectBrand}
          options={brandOptions}
          searchPlaceholder="Pesquisar marca..."
          value={brandId}
        />
        <FieldError message={errors.brandId?.message} />
      </div>

      {brandId ? (
        <div className="flex flex-col gap-1.5">
          <OptionCardPicker
            emptyMessage="Nenhum modelo disponível pra essa marca."
            emptySearchMessage="Nenhum modelo encontrado."
            imageSize="lg"
            key={brandId}
            label="Modelo"
            onSelect={handleSelectModel}
            options={modelOptions}
            searchPlaceholder="Pesquisar modelo..."
            value={printerModelId}
          />
          <FieldError message={errors.printerModelId?.message} />
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nickname">Apelido (opcional)</Label>
        <Input
          id="nickname"
          placeholder="Ex: A1 Mini da sala"
          {...register("nickname")}
        />
        <FieldError message={errors.nickname?.message} />
      </div>

      <div className="grid grid-cols-2 gap-2">
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
          <Label htmlFor="defaultProfitMarginPercentage">Margem de lucro</Label>
          <NumberField
            control={control}
            decimals={2}
            id="defaultProfitMarginPercentage"
            name="defaultProfitMarginPercentage"
            suffix="%"
          />
          <FieldError message={errors.defaultProfitMarginPercentage?.message} />
        </div>
      </div>

      <Separator />

      {isDepreciationLocked || isMaintenanceLocked || isFailureLocked ? (
        <UpgradeNotice message="Depreciação, manutenção e perda por falha não estão disponíveis no seu plano." />
      ) : null}

      <OptionalCost
        control={control}
        description="Desgaste da impressora a cada hora impressa"
        disabled={isDepreciationLocked}
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
        disabled={!depreciationEnabled || isMaintenanceLocked}
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
        disabled={isFailureLocked}
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

      {renderActions ? (
        renderActions({ isSubmitting })
      ) : (
        <SideSheetActions>
          <SheetClose render={<Button type="button" variant="outline" />}>
            Cancelar
          </SheetClose>
          <Button disabled={isSubmitting} type="submit">
            {submitLabel}
          </Button>
        </SideSheetActions>
      )}
    </form>
  );
}
