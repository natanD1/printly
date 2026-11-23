"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { NumberField } from "@/components/number-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { type SettingsSchema, settingsSchema } from "@/schemas/settings-schema";
import type { ApiErrorResponse } from "@/types/auth";
import type { Settings } from "@/types/settings";

interface SettingsFormProps {
  onSubmit: (data: SettingsSchema) => Promise<void>;
  settings: Settings;
}

function getSubmitErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Erro inesperado";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro inesperado";
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

  const [status, setStatus] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  const submit = handleSubmit(async (data) => {
    setStatus(null);
    try {
      await onSubmit(data);
      setStatus({ message: "Preço do kWh salvo.", type: "success" });
    } catch (caughtError) {
      setStatus({
        message: getSubmitErrorMessage(caughtError),
        type: "error",
      });
    }
  });

  return (
    <form className="flex h-full flex-col" onSubmit={submit}>
      <Card className="flex flex-1 flex-col">
        <CardHeader className="border-b">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <Zap aria-hidden="true" className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <CardTitle>Energia</CardTitle>
              <CardDescription>
                Vale pra todas as impressoras. Potência, desgaste e margem ficam
                em cada{" "}
                <Link
                  className="cursor-pointer font-medium text-foreground underline underline-offset-2"
                  href="/impressoras"
                >
                  impressora
                </Link>
                .
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-center gap-4">
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

        <CardFooter className="flex-wrap justify-between gap-3">
          {status ? (
            <p
              className={
                status.type === "error"
                  ? "text-destructive text-xs"
                  : "text-emerald-600 text-xs dark:text-emerald-400"
              }
              role={status.type === "error" ? "alert" : "status"}
            >
              {status.message}
            </p>
          ) : (
            <span className="text-muted-foreground text-xs">
              Usado no cálculo automático de custo.
            </span>
          )}
          <Button disabled={isSubmitting} size="sm" type="submit">
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
