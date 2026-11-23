"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { ModalCommunication } from "@/components/modal-communication";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { companyProfileSchema } from "@/schemas/company-profile-schema";
import type { OnboardingStepProps } from "@/types/onboarding";

const onboardingCompanySchema = companyProfileSchema.pick({ name: true });

interface OnboardingCompanyValues {
  name: string;
}

export function OnboardingCompanyStep({ onDone }: OnboardingStepProps) {
  const { companyProfile, isLoading, updateCompanyProfile } =
    useCompanyProfile();
  const [saveError, setSaveError] = useState<string | null>(null);
  const isSavingRef = useRef<boolean>(false as boolean);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingCompanyValues>({
    defaultValues: { name: companyProfile?.name ?? "" },
    resolver: zodResolver(onboardingCompanySchema),
  });

  const submit = handleSubmit(async ({ name }) => {
    if (isSavingRef.current) {
      return;
    }
    isSavingRef.current = true;
    try {
      await updateCompanyProfile({
        email: companyProfile?.email ?? "",
        instagram: companyProfile?.instagram ?? "",
        logo: null,
        name,
        phone: companyProfile?.phone ?? "",
        removeLogo: false,
        website: companyProfile?.website ?? "",
        whatsApp: companyProfile?.whatsApp ?? "",
      });
      onDone();
    } catch (caughtError) {
      setSaveError(
        caughtError instanceof Error ? caughtError.message : "Erro inesperado"
      );
    } finally {
      isSavingRef.current = false;
    }
  });

  const handleErrorOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSaveError(null);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={submit}>
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-xl">Qual o nome do seu negócio?</h2>
        <p className="text-muted-foreground text-sm">
          Ele aparece nos orçamentos que você envia pros clientes. Telefone,
          logo e redes sociais dá pra completar depois em Configurações.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company-name">Nome da empresa ou loja</Label>
        <Input
          autoComplete="organization"
          className="h-10"
          id="company-name"
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="flex justify-end">
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
