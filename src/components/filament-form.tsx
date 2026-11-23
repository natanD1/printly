"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ChangeEvent, MouseEvent, ReactNode } from "react";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { NumberField } from "@/components/number-field";
import { OptionCardPicker } from "@/components/option-card-picker";
import { SideSheetActions } from "@/components/side-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetClose } from "@/components/ui/sheet";
import { useFilamentBrands } from "@/hooks/use-filament-brands";
import { useFilamentTypes } from "@/hooks/use-filament-types";
import { cn } from "@/lib/utils";
import { type FilamentSchema, filamentSchema } from "@/schemas/filament-schema";

interface FilamentFormProps {
  defaultValues?: FilamentSchema;
  onSubmit: (data: FilamentSchema) => Promise<void>;
  renderActions?: (state: { isSubmitting: boolean }) => ReactNode;
  submitLabel: string;
}

const EMPTY_VALUES: FilamentSchema = {
  brandId: "",
  colorHex: "#000000",
  filamentPrice: 0,
  name: "",
  typeId: "",
  weight: 0,
};

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export function FilamentForm({
  defaultValues,
  onSubmit,
  renderActions,
  submitLabel,
}: FilamentFormProps) {
  const { filamentBrands } = useFilamentBrands();
  const { filamentTypes } = useFilamentTypes();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FilamentSchema>({
    defaultValues: defaultValues ?? EMPTY_VALUES,
    resolver: zodResolver(filamentSchema),
  });

  const colorHex = watch("colorHex");
  const brandId = watch("brandId");
  const typeId = watch("typeId");

  const submit = handleSubmit(onSubmit);

  const handleColorPickerChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue("colorHex", event.target.value, { shouldValidate: true });
    },
    [setValue]
  );

  const handleSelectBrand = useCallback(
    (id: string) => {
      setValue("brandId", id, { shouldValidate: true });
    },
    [setValue]
  );

  const handleSelectType = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const { id } = event.currentTarget.dataset;
      if (id) {
        setValue("typeId", id, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const brandOptions = useMemo(
    () =>
      filamentBrands
        .filter((brand) => brand.isActive || brand.id === brandId)
        .map((brand) => ({
          id: brand.id,
          image: brand.imageBrand,
          label: brand.nameBrand,
        })),
    [brandId, filamentBrands]
  );
  const activeTypes = filamentTypes.filter(
    (type) => type.isActive || type.id === typeId
  );

  return (
    <form className="flex flex-1 flex-col gap-4" onSubmit={submit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" {...register("name")} />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="weight">Peso</Label>
          <NumberField
            control={control}
            decimals={3}
            id="weight"
            name="weight"
            suffix="kg"
          />
          <FieldError message={errors.weight?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filamentPrice">Preço pago</Label>
          <NumberField
            control={control}
            decimals={2}
            fixed
            id="filamentPrice"
            name="filamentPrice"
            prefix="R$"
          />
          <FieldError message={errors.filamentPrice?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="colorHex">Cor</Label>
        <div className="flex items-center gap-2">
          <input
            aria-label="Selecionar cor"
            className="size-8 shrink-0 cursor-pointer rounded-lg border border-input bg-transparent"
            onChange={handleColorPickerChange}
            type="color"
            value={HEX_COLOR_REGEX.test(colorHex) ? colorHex : "#000000"}
          />
          <Input
            id="colorHex"
            placeholder="#2810E2"
            {...register("colorHex")}
          />
        </div>
        <FieldError message={errors.colorHex?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <OptionCardPicker
          emptyMessage="Nenhuma marca cadastrada."
          emptySearchMessage="Nenhuma marca encontrada."
          label="Marca"
          onSelect={handleSelectBrand}
          options={brandOptions}
          searchPlaceholder="Pesquisar marca..."
          value={brandId}
        />
        <FieldError message={errors.brandId?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Tipo</Label>
        <div className="grid grid-cols-4 gap-2">
          {activeTypes.length ? (
            activeTypes.map((type) => (
              <button
                className={cn(
                  "cursor-pointer truncate rounded-lg border px-2.5 py-1.5 text-center text-sm transition-colors hover:bg-accent",
                  typeId === type.id
                    ? "border-primary ring-1 ring-primary"
                    : "border-input"
                )}
                data-id={type.id}
                key={type.id}
                onClick={handleSelectType}
                type="button"
              >
                {type.name}
              </button>
            ))
          ) : (
            <p className="col-span-4 text-muted-foreground text-sm">
              Nenhum tipo cadastrado.
            </p>
          )}
        </div>
        <FieldError message={errors.typeId?.message} />
      </div>

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
