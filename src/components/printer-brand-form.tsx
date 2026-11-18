"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { SideSheetActions } from "@/components/side-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetClose } from "@/components/ui/sheet";
import {
  type PrinterBrandSchema,
  printerBrandSchema,
} from "@/schemas/printer-brand-schema";

interface PrinterBrandFormProps {
  defaultValues?: PrinterBrandSchema;
  onSubmit: (data: PrinterBrandSchema) => Promise<void>;
  submitLabel: string;
}

const EMPTY_VALUES: PrinterBrandSchema = {
  name: "",
};

export function PrinterBrandForm({
  defaultValues,
  onSubmit,
  submitLabel,
}: PrinterBrandFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PrinterBrandSchema>({
    defaultValues: defaultValues ?? EMPTY_VALUES,
    resolver: zodResolver(printerBrandSchema),
  });

  const submit = handleSubmit(onSubmit);

  return (
    <form className="flex flex-1 flex-col gap-4" onSubmit={submit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" {...register("name")} />
        <FieldError message={errors.name?.message} />
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
