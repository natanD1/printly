"use client";

import { Plus, RefreshCw, ShieldAlert, Store } from "lucide-react";
import Link from "next/link";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { ShowcaseAddProductsSheet } from "@/components/showcase-add-products-sheet";
import { ShowcaseItemRow } from "@/components/showcase-item-row";
import { ShowcaseLinkCard } from "@/components/showcase-link-card";
import { Button } from "@/components/ui/button";
import { UpgradeNotice } from "@/components/upgrade-notice";
import { useEntitlement } from "@/hooks/use-entitlement";
import { getShowcaseErrorCode, useShowcase } from "@/hooks/use-showcase";
import { PLAN_ERROR_CODES } from "@/types/plan";
import type { ExistingShowcase } from "@/types/showcase";

interface ActionError {
  isPlanError: boolean;
  message: string;
  title: string;
}

interface ShowcaseManagerProps {
  showcase: ExistingShowcase;
}

function Banner({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "danger" | "warning";
}) {
  const className =
    tone === "danger"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";

  return (
    <div
      className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-sm ${className}`}
      role="status"
    >
      {children}
    </div>
  );
}

export function ShowcaseManager({ showcase }: ShowcaseManagerProps) {
  const {
    addItems,
    fetchShowcase,
    removeItem,
    reorderItems,
    setItemVisibility,
    setPublished,
  } = useShowcase();
  const logo = useEntitlement("CompanyLogoInQuote");
  const [origin, setOrigin] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [actionError, setActionError] = useState<ActionError | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const { isBlocked, isPublished, limit, planAllows, slug, used } = showcase;
  const writesDisabled = !planAllows || isBusy;
  const remaining = limit === null ? null : Math.max(0, limit - used);

  const items = useMemo(
    () => [...showcase.items].sort((a, b) => a.sortOrder - b.sortOrder),
    [showcase.items]
  );

  const runAction = useCallback(
    async (action: () => Promise<void>, title: string) => {
      setIsBusy(true);
      try {
        await action();
      } catch (caughtError) {
        const code = getShowcaseErrorCode(caughtError);
        setActionError({
          isPlanError:
            code === PLAN_ERROR_CODES.limitReached ||
            code === PLAN_ERROR_CODES.featureUnavailable,
          message:
            caughtError instanceof Error
              ? caughtError.message
              : "Erro inesperado",
          title,
        });
      } finally {
        setIsBusy(false);
      }
    },
    []
  );

  const handlePublishedChange = useCallback(
    (nextPublished: boolean) => {
      runAction(
        () => setPublished(nextPublished),
        "Erro ao alterar a publicação"
      );
    },
    [runAction, setPublished]
  );

  const handleMove = useCallback(
    (productId: string, direction: -1 | 1) => {
      const ids = items.map((item) => item.productId);
      const from = ids.indexOf(productId);
      const to = from + direction;

      if (from < 0 || to < 0 || to >= ids.length) {
        return;
      }

      [ids[from], ids[to]] = [ids[to], ids[from]];
      runAction(() => reorderItems(ids), "Erro ao reordenar");
    },
    [items, reorderItems, runAction]
  );

  const handleToggleVisibility = useCallback(
    (productId: string, isVisible: boolean) => {
      runAction(
        () => setItemVisibility(productId, isVisible),
        isVisible ? "Erro ao mostrar o produto" : "Erro ao ocultar o produto"
      );
    },
    [runAction, setItemVisibility]
  );

  const handleOpenAdd = useCallback(() => {
    setIsAddOpen(true);
  }, []);

  const handleErrorOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setActionError(null);
    }
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4">
      {isBlocked ? (
        <Banner tone="danger">
          <span className="flex items-center gap-2 font-medium">
            <ShieldAlert className="size-4" />
            Vitrine bloqueada pela administração
          </span>
          <span>
            Ela não aparece para o público até ser liberada. Fale com o suporte.
          </span>
        </Banner>
      ) : null}

      {planAllows ? null : (
        <Banner tone="warning">
          <span className="font-medium">
            Vitrine indisponível ao público no seu plano atual
          </span>
          <span>
            Nada foi apagado: seus produtos e a ordem continuam salvos. Voltar
            para um plano com vitrine restaura tudo. Enquanto isso, só é
            possível remover itens.
          </span>
          <UpgradeNotice message="Seu plano atual não inclui a vitrine." />
        </Banner>
      )}

      <ShowcaseLinkCard
        disabled={writesDisabled}
        isPublished={isPublished}
        onPublishedChange={handlePublishedChange}
        origin={origin}
        slug={slug}
      />

      <p className="text-muted-foreground text-sm">
        Os contatos preenchidos em Configurações → Empresa aparecem publicamente
        nesta página.{" "}
        <Link
          className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline"
          href="/configuracoes"
        >
          Abrir Configurações
        </Link>
      </p>

      {logo.enabled ? null : (
        <div className="flex flex-col items-start gap-2">
          <p className="text-muted-foreground text-sm">
            A logo da empresa não aparece na vitrine no seu plano.
          </p>
          <UpgradeNotice message="Exibir a logo na vitrine exige um plano superior." />
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading font-medium text-lg">
          {limit === null
            ? `${used} ${used === 1 ? "produto" : "produtos"}`
            : `${used} de ${limit} ${limit === 1 ? "produto" : "produtos"}`}
          <span className="ml-2 font-normal text-muted-foreground text-sm">
            na vitrine pública
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <Button onClick={fetchShowcase} size="lg" variant="outline">
            <RefreshCw />
            Atualizar
          </Button>
          <Button disabled={writesDisabled} onClick={handleOpenAdd} size="lg">
            <Plus />
            Adicionar produtos
          </Button>
        </div>
      </div>

      {items.length ? (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <ShowcaseItemRow
              disabled={writesDisabled}
              index={index}
              item={item}
              key={item.productId}
              limit={limit}
              onMove={handleMove}
              onRemove={removeItem}
              onToggleVisibility={handleToggleVisibility}
              total={items.length}
            />
          ))}
        </ul>
      ) : (
        <div className="flex min-h-48 flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
          <Store aria-hidden="true" className="size-8" />
          <p className="text-sm">
            Nenhum produto na vitrine ainda. Adicione produtos já produzidos.
          </p>
        </div>
      )}

      <ShowcaseAddProductsSheet
        onOpenChange={setIsAddOpen}
        onSubmit={addItems}
        open={isAddOpen}
        remaining={remaining}
      />

      <ModalCommunication
        description={actionError?.message}
        extraAction={
          actionError?.isPlanError
            ? { href: "/assinatura", label: "Ver planos" }
            : undefined
        }
        onOpenChange={handleErrorOpenChange}
        open={actionError !== null}
        title={actionError?.title ?? ""}
        variant="error"
      />
    </div>
  );
}
