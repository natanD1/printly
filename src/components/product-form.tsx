"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ChangeEvent } from "react";
import { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { NumberField } from "@/components/number-field";
import { NumberInput } from "@/components/number-input";
import { ProductFilamentPicker } from "@/components/product-filament-picker";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFilaments } from "@/hooks/use-filaments";
import { type ProductSchema, productSchema } from "@/schemas/product-schema";

interface ProductFormProps {
  defaultValues?: ProductSchema;
  existingPhotoPreview?: string | null;
  onSubmit: (data: ProductSchema) => Promise<void>;
  submitLabel: string;
}

const EMPTY_VALUES: ProductSchema = {
  filaments: [],
  photo: null,
  piecesPerPrint: 1,
  productName: "",
  quantity: 1,
  salePriceOverride: null,
  totalHours: 0,
};

export function ProductForm({
  defaultValues,
  existingPhotoPreview,
  onSubmit,
  submitLabel,
}: ProductFormProps) {
  const { filaments } = useFilaments();
  const form = useForm<ProductSchema>({
    defaultValues: defaultValues ?? EMPTY_VALUES,
    resolver: zodResolver(productSchema),
  });
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const initialTotalHours =
    defaultValues?.totalHours ?? EMPTY_VALUES.totalHours;
  const initialHoursPart = Math.floor(initialTotalHours);
  const [hoursPart, setHoursPart] = useState(initialHoursPart);
  const [minutesPart, setMinutesPart] = useState(
    Math.round((initialTotalHours - initialHoursPart) * 60)
  );

  // Preço de venda 0 ou vazio = "usar o sugerido": manda null pro backend não sobrescrever o preço calculado.
  const submit = handleSubmit((data) =>
    onSubmit({ ...data, salePriceOverride: data.salePriceOverride || null })
  );

  const handlePhotoChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue("photo", event.target.files?.[0] ?? null);
    },
    [setValue]
  );

  const handleHoursChange = useCallback(
    (value: number | null) => {
      const hours = value ?? 0;
      setHoursPart(hours);
      setValue("totalHours", hours + minutesPart / 60, {
        shouldValidate: true,
      });
    },
    [minutesPart, setValue]
  );

  const handleMinutesChange = useCallback(
    (value: number | null) => {
      const minutes = value ?? 0;
      setMinutesPart(minutes);
      setValue("totalHours", hoursPart + minutes / 60, {
        shouldValidate: true,
      });
    },
    [hoursPart, setValue]
  );

  return (
    <FormProvider {...form}>
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="productName">Nome</Label>
          <Input id="productName" {...register("productName")} />
          <FieldError message={errors.productName?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="totalHoursPart">Tempo por impressão</Label>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              id="totalHoursPart"
              onValueChange={handleHoursChange}
              suffix="h"
              value={hoursPart}
            />
            <NumberInput
              aria-label="Minutos"
              id="totalMinutesPart"
              max={59}
              onValueChange={handleMinutesChange}
              suffix="min"
              value={minutesPart}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            {hoursPart}h{minutesPart.toString().padStart(2, "0")}min de uma
            impressão, como o fatiador mostra
          </p>
          <FieldError message={errors.totalHours?.message} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="piecesPerPrint">Peças por impressão</Label>
            <NumberField
              control={control}
              id="piecesPerPrint"
              max={9999}
              name="piecesPerPrint"
              suffix="un"
            />
            <p className="text-muted-foreground text-xs">
              Quantas saem de uma mesa
            </p>
            <FieldError message={errors.piecesPerPrint?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quantity">Quantidade</Label>
            <NumberField
              control={control}
              id="quantity"
              max={9999}
              name="quantity"
              suffix="un"
            />
            <p className="text-muted-foreground text-xs">
              Total de peças a produzir
            </p>
            <FieldError message={errors.quantity?.message} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="salePriceOverride">Preço por unidade</Label>
          <NumberField
            control={control}
            decimals={2}
            fixed
            id="salePriceOverride"
            name="salePriceOverride"
            nullable
            placeholder="Sugerido"
            prefix="R$"
          />
          <p className="text-muted-foreground text-xs">
            Vazio usa o preço sugerido
          </p>
          <FieldError message={errors.salePriceOverride?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="photo">Foto</Label>
          {existingPhotoPreview ? (
            // biome-ignore lint/performance/noImgElement: preview de base64 vindo da API, sem otimização de imagem aplicável
            <img
              alt="Foto atual do produto"
              className="h-24 w-24 rounded-lg object-cover"
              height={96}
              src={`data:image/jpeg;base64,${existingPhotoPreview}`}
              width={96}
            />
          ) : null}
          <Input
            accept="image/*"
            id="photo"
            onChange={handlePhotoChange}
            type="file"
          />
        </div>

        <ProductFilamentPicker filaments={filaments} />

        <div className="flex justify-end gap-2">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancelar
          </DialogClose>
          <Button disabled={isSubmitting} type="submit">
            {submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
