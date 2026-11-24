"use client";

import { Eye, Link2, Lock, Rocket, Share2, Store } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { ShowcaseManager } from "@/components/showcase-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { getShowcaseErrorCode, useShowcase } from "@/hooks/use-showcase";
import { PLAN_ERROR_CODES } from "@/types/plan";

interface CreateError {
  isPlanError: boolean;
  message: string;
}

const SHOWCASE_HIGHLIGHTS = [
  {
    description: "Endereço personalizado com o nome da sua empresa.",
    icon: Link2,
    title: "Link próprio",
  },
  {
    description: "Escolha quais produtos produzidos ficam visíveis.",
    icon: Eye,
    title: "Controle total",
  },
  {
    description: "Compartilhe no WhatsApp, Instagram ou na bio.",
    icon: Share2,
    title: "Fácil de enviar",
  },
] as const;

export function ShowcaseOverview() {
  const { createShowcase, error, isLoading, showcase } = useShowcase();
  const { companyProfile, isLoading: isCompanyLoading } = useCompanyProfile();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<CreateError | null>(null);

  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    try {
      await createShowcase();
    } catch (caughtError) {
      const code = getShowcaseErrorCode(caughtError);
      setCreateError({
        isPlanError:
          code === PLAN_ERROR_CODES.limitReached ||
          code === PLAN_ERROR_CODES.featureUnavailable,
        message:
          caughtError instanceof Error
            ? caughtError.message
            : "Erro inesperado",
      });
    } finally {
      setIsCreating(false);
    }
  }, [createShowcase]);

  const handleErrorOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setCreateError(null);
    }
  }, []);

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  if (error || !showcase) {
    return (
      <p className="text-destructive text-sm">
        {error ?? "Não foi possível carregar a vitrine."}
      </p>
    );
  }

  if (showcase.exists) {
    return <ShowcaseManager showcase={showcase} />;
  }

  if (!showcase.planAllows) {
    return (
      <div className="flex flex-1 items-center justify-center py-6">
        <Card className="w-full max-w-xl [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
          <CardContent className="flex flex-col items-center gap-6 text-center">
            <div className="relative flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Store aria-hidden="true" className="size-8" />
              <span className="absolute -right-1.5 -bottom-1.5 flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted text-muted-foreground shadow-xs">
                <Lock aria-hidden="true" className="size-3.5" />
              </span>
            </div>

            <div className="flex flex-col items-center gap-2.5">
              <Badge className="gap-1.5 px-3 py-1" variant="secondary">
                <Lock aria-hidden="true" className="size-3 text-primary" />
                Disponível em planos superiores
              </Badge>
              <h2 className="font-bold font-heading text-2xl tracking-tight">
                Mostre seu catálogo em uma vitrine pública
              </h2>
              <p className="max-w-md text-muted-foreground text-sm leading-relaxed">
                Crie uma página exclusiva com os produtos que você já produziu —
                com foto, nome e preço unitário — pronta para enviar aos seus
                clientes.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-2.5 text-left sm:grid-cols-3">
              {SHOWCASE_HIGHLIGHTS.map((item) => (
                <div
                  className="flex flex-col gap-1.5 rounded-xl border bg-muted/30 p-3.5"
                  key={item.title}
                >
                  <item.icon
                    aria-hidden="true"
                    className="size-4 text-primary"
                  />
                  <span className="font-medium text-xs">{item.title}</span>
                  <span className="text-[0.7rem] text-muted-foreground leading-snug">
                    {item.description}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex-col items-center justify-between gap-3 sm:flex-row">
            <span className="text-center text-muted-foreground text-xs sm:text-left">
              Faça upgrade do seu plano para ativar sua vitrine.
            </span>
            <Button
              nativeButton={false}
              render={<Link href="/assinatura" />}
              size="lg"
            >
              <Rocket />
              Ver planos
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const hasCompanyName =
    isCompanyLoading || Boolean(companyProfile?.name?.trim());

  return (
    <>
      <div className="flex flex-1 items-center justify-center py-6">
        <Card className="w-full max-w-xl [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
          <CardContent className="flex flex-col items-center gap-5 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Store aria-hidden="true" className="size-8" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <h2 className="font-bold font-heading text-2xl tracking-tight">
                Crie sua vitrine
              </h2>
              <p className="max-w-md text-muted-foreground text-sm leading-relaxed">
                A vitrine é uma página pública com os produtos que você
                escolher, com nome, foto e valor unitário, para compartilhar o
                link com clientes. O endereço é gerado a partir do nome da
                empresa e pode ser alterado depois.
              </p>
            </div>

            {hasCompanyName ? null : (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-700 text-xs dark:text-amber-300">
                Cadastre o nome da empresa antes de criar a vitrine:{" "}
                <Link
                  className="cursor-pointer font-medium underline underline-offset-4"
                  href="/configuracoes"
                >
                  abrir Configurações
                </Link>
                .
              </p>
            )}
          </CardContent>

          <CardFooter className="justify-center">
            <Button disabled={isCreating} onClick={handleCreate} size="lg">
              <Store />
              {isCreating ? "Criando..." : "Criar minha vitrine"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <ModalCommunication
        description={createError?.message}
        extraAction={
          createError?.isPlanError
            ? { href: "/assinatura", label: "Ver planos" }
            : { href: "/configuracoes", label: "Abrir Configurações" }
        }
        onOpenChange={handleErrorOpenChange}
        open={createError !== null}
        title="Erro ao criar a vitrine"
        variant="error"
      />
    </>
  );
}
