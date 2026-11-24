"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, ImageIcon, Trash2 } from "lucide-react";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { FileInput } from "@/components/file-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UpgradeNotice } from "@/components/upgrade-notice";
import { useEntitlement } from "@/hooks/use-entitlement";
import {
  type CompanyProfileSchema,
  companyProfileSchema,
} from "@/schemas/company-profile-schema";
import type { CompanyProfile } from "@/types/company-profile";

interface CompanyProfileFormProps {
  companyProfile: CompanyProfile | null;
  onSubmit: (data: CompanyProfileSchema) => Promise<void>;
}

const PNG_BASE64_PREFIX = "iVBOR";

function getLogoDataUri(logoBase64: string): string {
  const mimeType = logoBase64.startsWith(PNG_BASE64_PREFIX)
    ? "image/png"
    : "image/jpeg";

  return `data:${mimeType};base64,${logoBase64}`;
}

export function CompanyProfileForm({
  companyProfile,
  onSubmit,
}: CompanyProfileFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompanyProfileSchema>({
    defaultValues: {
      email: companyProfile?.email ?? "",
      instagram: companyProfile?.instagram ?? "",
      logo: null,
      name: companyProfile?.name ?? "",
      phone: companyProfile?.phone ?? "",
      removeLogo: false,
      website: companyProfile?.website ?? "",
      whatsApp: companyProfile?.whatsApp ?? "",
    },
    resolver: zodResolver(companyProfileSchema),
  });

  // Sem o recurso no plano, não envia logo novo; o já salvo continua visível e removível.
  const { enabled: canUploadLogo } = useEntitlement("CompanyLogoInQuote");

  const [fileInputKey, setFileInputKey] = useState(0);
  const [status, setStatus] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [newLogoUrl, setNewLogoUrl] = useState<string | null>(null);

  const logo = watch("logo");
  const removeLogo = watch("removeLogo");

  useEffect(() => {
    if (!logo) {
      setNewLogoUrl(null);
      return;
    }

    const url = URL.createObjectURL(logo);
    setNewLogoUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [logo]);

  let logoPreview: string | null = null;
  if (newLogoUrl) {
    logoPreview = newLogoUrl;
  } else if (companyProfile?.logoBase64 && !removeLogo) {
    logoPreview = getLogoDataUri(companyProfile.logoBase64);
  }

  // Trocar a key remonta o <input type="file"> e limpa o arquivo escolhido.
  const clearFileInput = useCallback(
    () => setFileInputKey((key) => key + 1),
    []
  );

  const handleLogoChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;

      setValue("logo", file, { shouldValidate: true });
      if (file) {
        setValue("removeLogo", false);
      }
    },
    [setValue]
  );

  // Com arquivo novo escolhido, só descarta ele (volta pro logo salvo);
  // sem arquivo novo, marca o logo salvo pra remoção.
  const handleRemoveLogo = useCallback(() => {
    if (!logo) {
      setValue("removeLogo", true);
    }
    setValue("logo", null, { shouldValidate: true });
    clearFileInput();
  }, [clearFileInput, logo, setValue]);

  const submit = handleSubmit(async (data) => {
    setStatus(null);
    try {
      await onSubmit(data);
      setValue("logo", null);
      setValue("removeLogo", false);
      clearFileInput();
      setStatus({ message: "Identidade da empresa salva.", type: "success" });
    } catch (caughtError) {
      setStatus({
        message:
          caughtError instanceof Error
            ? caughtError.message
            : "Erro inesperado",
        type: "error",
      });
    }
  });

  return (
    <form onSubmit={submit}>
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <Building2 aria-hidden="true" className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <CardTitle>Identidade da empresa</CardTitle>
              <CardDescription>
                Esses dados aparecem nos orçamentos que você envia aos clientes.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="company-name">Nome da empresa</Label>
              <Input id="company-name" {...register("name")} />
              <span className="text-muted-foreground text-xs">
                Também define o endereço da sua vitrine pública. Trocar o nome
                troca o link, e o antigo deixa de funcionar.
              </span>
              <FieldError message={errors.name?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-phone">Telefone</Label>
              <Input id="company-phone" type="tel" {...register("phone")} />
              <FieldError message={errors.phone?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-whatsapp">WhatsApp</Label>
              <Input
                id="company-whatsapp"
                type="tel"
                {...register("whatsApp")}
              />
              <FieldError message={errors.whatsApp?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-email">E-mail</Label>
              <Input id="company-email" type="email" {...register("email")} />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-instagram">Instagram</Label>
              <Input
                id="company-instagram"
                placeholder="@suaempresa"
                {...register("instagram")}
              />
              <FieldError message={errors.instagram?.message} />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="company-website">Site</Label>
              <Input
                id="company-website"
                placeholder="https://"
                {...register("website")}
              />
              <FieldError message={errors.website?.message} />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="company-logo">Logo nos orçamentos</Label>
              <span className="text-muted-foreground text-xs">
                PNG ou JPG, até 500 KB.
              </span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {logoPreview ? (
                // biome-ignore lint/performance/noImgElement: preview de base64/blob local, sem otimização de imagem aplicável
                <img
                  alt="Logo da empresa"
                  className="size-24 shrink-0 rounded-xl border border-input bg-card object-contain p-2"
                  height={96}
                  src={logoPreview}
                  width={96}
                />
              ) : (
                <div className="flex size-24 shrink-0 items-center justify-center rounded-xl border border-dashed bg-card text-muted-foreground">
                  <ImageIcon aria-hidden="true" className="size-6" />
                </div>
              )}

              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <FileInput
                    accept="image/png,image/jpeg"
                    className="flex-1 rounded-lg bg-card"
                    disabled={!canUploadLogo}
                    fileName={logo?.name ?? null}
                    id="company-logo"
                    key={fileInputKey}
                    onChange={handleLogoChange}
                  />
                  {logoPreview ? (
                    <Button
                      onClick={handleRemoveLogo}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Trash2 />
                      Remover logo
                    </Button>
                  ) : null}
                </div>

                {canUploadLogo ? null : (
                  <UpgradeNotice message="O logo da empresa no orçamento não está disponível no seu plano." />
                )}
                <FieldError message={errors.logo?.message} />
              </div>
            </div>
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
              As alterações valem para os próximos orçamentos gerados.
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
