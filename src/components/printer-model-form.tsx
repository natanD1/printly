"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ChangeEvent } from "react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { FileInput } from "@/components/file-input";
import { OptionChips } from "@/components/option-chips";
import { SideSheetActions } from "@/components/side-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetClose } from "@/components/ui/sheet";
import { usePrinterBrands } from "@/hooks/use-printer-brands";
import {
  type PrinterModelSchema,
  printerModelSchema,
} from "@/schemas/printer-model-schema";

interface PrinterModelFormProps {
  defaultValues?: PrinterModelSchema;
  existingImagePreview?: string | null;
  onSubmit: (data: PrinterModelSchema) => Promise<void>;
  submitLabel: string;
}

const EMPTY_VALUES: PrinterModelSchema = {
  brandId: "",
  image: null,
  name: "",
};

export function PrinterModelForm({
  defaultValues,
  existingImagePreview,
  onSubmit,
  submitLabel,
}: PrinterModelFormProps) {
  const { printerBrands } = usePrinterBrands();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PrinterModelSchema>({
    defaultValues: defaultValues ?? EMPTY_VALUES,
    resolver: zodResolver(printerModelSchema),
  });

  const brandId = watch("brandId");
  const submit = handleSubmit(onSubmit);

  const handleSelectBrand = useCallback(
    (id: string) => setValue("brandId", id, { shouldValidate: true }),
    [setValue]
  );

  const brandOptions = printerBrands
    .filter((brand) => brand.isActive || brand.id === brandId)
    .map((brand) => ({ id: brand.id, label: brand.name }));

  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue("image", event.target.files?.[0] ?? null);
    },
    [setValue]
  );

  return (
    <form className="flex flex-1 flex-col gap-4" onSubmit={submit}>
      <div className="flex flex-col gap-1.5">
        <Label>Marca</Label>
        <OptionChips
          emptyMessage="Nenhuma marca de impressora cadastrada."
          onSelect={handleSelectBrand}
          options={brandOptions}
          value={brandId}
        />
        <FieldError message={errors.brandId?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Modelo</Label>
        <Input id="name" {...register("name")} />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="image">Imagem</Label>
        {existingImagePreview ? (
          // biome-ignore lint/performance/noImgElement: preview de base64 vindo da API, sem otimização de imagem aplicável
          <img
            alt="Imagem atual do modelo"
            className="size-32 rounded-xl border border-input bg-muted object-contain p-2"
            height={128}
            src={`data:image/png;base64,${existingImagePreview}`}
            width={128}
          />
        ) : null}
        <FileInput accept="image/*" id="image" onChange={handleImageChange} />
      </div>

      <SideSheetActions>
        <SheetClose render={<Button type="button" variant="outline" />}>
          Cancelar
        </SheetClose>
        <Button disabled={isSubmitting} type="submit">
          {submitLabel}
        </Button>
      </SideSheetActions>
    </form>
  );
}
