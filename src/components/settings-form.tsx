"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Zap } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { NumberField } from "@/components/number-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { type SettingsSchema, settingsSchema } from "@/schemas/settings-schema";
import type { Settings } from "@/types/settings";

interface SettingsFormProps {
  onSubmit: (data: SettingsSchema) => Promise<void>;
  settings: Settings;
}

export function SettingsForm({ onSubmit, settings }: SettingsFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsSchema>({
    defaultValues: { kwhPrice: settings.kwhPrice },
    resolver: zodResolver(settingsSchema),
  });

  const submit = handleSubmit(onSubmit);

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-4 text-amber-500 dark:text-amber-400" />
            Energia
          </CardTitle>
          <CardDescription>
            Vale pra todas as impressoras. Potência, desgaste e margem ficam em
            cada{" "}
            <Link className="underline underline-offset-2" href="/impressoras">
              impressora
            </Link>
            .
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
        </CardContent>
      </Card>

      <Button className="w-fit" disabled={isSubmitting} type="submit">
        Salvar
      </Button>
    </form>
  );
}
