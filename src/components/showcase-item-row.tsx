"use client";

import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImageOff,
  Trash2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShowcasePhoto } from "@/hooks/use-showcase-photo";
import type { ShowcaseItem } from "@/types/showcase";
import { formatCurrency } from "@/utils/format-currency";

interface ShowcaseItemRowProps {
  /** Escritas (ordenar, mostrar/ocultar) bloqueadas: ocupado ou plano sem vitrine. Remover continua livre. */
  disabled: boolean;
  index: number;
  item: ShowcaseItem;
  limit: number | null;
  onMove: (productId: string, direction: -1 | 1) => void;
  onRemove: (productId: string) => Promise<void>;
  onToggleVisibility: (productId: string, isVisible: boolean) => void;
  total: number;
}

function ItemThumb({ item }: { item: ShowcaseItem }) {
  const { photo } = useShowcasePhoto(item.productId, item.hasPhoto);

  if (photo) {
    return (
      // biome-ignore lint/performance/noImgElement: imagem gerada em runtime (data URL), não passa pelo otimizador do next/image
      <img
        alt={item.name}
        className="size-14 shrink-0 rounded-md border object-cover"
        height={56}
        src={photo}
        width={56}
      />
    );
  }

  return (
    <div className="flex size-14 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
      <ImageOff className="size-5" />
    </div>
  );
}

export function ShowcaseItemRow({
  disabled,
  index,
  item,
  limit,
  onMove,
  onRemove,
  onToggleVisibility,
  total,
}: ShowcaseItemRowProps) {
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMoveUp = useCallback(() => {
    onMove(item.productId, -1);
  }, [item.productId, onMove]);

  const handleMoveDown = useCallback(() => {
    onMove(item.productId, 1);
  }, [item.productId, onMove]);

  const handleToggleVisibility = useCallback(() => {
    onToggleVisibility(item.productId, !item.isVisible);
  }, [item.productId, item.isVisible, onToggleVisibility]);

  const handleOpenRemove = useCallback(() => {
    setIsRemoveOpen(true);
  }, []);

  const handleRemove = useCallback(async () => {
    setIsRemoving(true);
    try {
      await onRemove(item.productId);
      setIsRemoveOpen(false);
    } catch (caughtError) {
      setErrorMessage(
        caughtError instanceof Error ? caughtError.message : "Erro inesperado"
      );
    } finally {
      setIsRemoving(false);
    }
  }, [item.productId, onRemove]);

  const handleErrorOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setErrorMessage(null);
    }
  }, []);

  const warnings: string[] = [];
  if (!item.productIsProduced) {
    warnings.push(
      "Voltou para orçamento: não aparece até ser marcado como produzido."
    );
  } else if (item.outsidePlan) {
    warnings.push(
      `Não aparece na vitrine pública: seu plano permite ${limit} ${limit === 1 ? "item" : "itens"}.`
    );
  }

  return (
    <li className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex flex-col">
        <Button
          aria-label="Mover para cima"
          disabled={disabled || index === 0}
          onClick={handleMoveUp}
          size="icon-xs"
          variant="ghost"
        >
          <ArrowUp />
        </Button>
        <Button
          aria-label="Mover para baixo"
          disabled={disabled || index === total - 1}
          onClick={handleMoveDown}
          size="icon-xs"
          variant="ghost"
        >
          <ArrowDown />
        </Button>
      </div>

      <ItemThumb item={item} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`truncate font-medium text-sm ${item.isVisible ? "" : "text-muted-foreground"}`}
          >
            {item.name}
          </span>
          {item.isVisible ? null : <Badge variant="secondary">Oculto</Badge>}
          {item.hasPhoto ? null : <Badge variant="outline">Sem foto</Badge>}
        </div>
        <span className="text-muted-foreground text-sm">
          {formatCurrency(item.unitSalePrice)} por unidade
        </span>
        {warnings.map((warning) => (
          <span
            className="text-amber-600 text-xs dark:text-amber-400"
            key={warning}
          >
            {warning}
          </span>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          aria-label={
            item.isVisible ? "Ocultar da vitrine" : "Mostrar na vitrine"
          }
          disabled={disabled}
          onClick={handleToggleVisibility}
          size="icon"
          variant="ghost"
        >
          {item.isVisible ? <Eye /> : <EyeOff />}
        </Button>
        <Button
          aria-label="Remover da vitrine"
          onClick={handleOpenRemove}
          size="icon"
          variant="ghost"
        >
          <Trash2 />
        </Button>
      </div>

      <ModalCommunication
        confirmLabel="Remover"
        description={`"${item.name}" sai da vitrine. O produto continua cadastrado.`}
        isConfirming={isRemoving}
        onConfirm={handleRemove}
        onOpenChange={setIsRemoveOpen}
        open={isRemoveOpen}
        title="Remover da vitrine?"
        variant="warning"
      />

      <ModalCommunication
        description={errorMessage ?? undefined}
        onOpenChange={handleErrorOpenChange}
        open={errorMessage !== null}
        title="Erro ao remover da vitrine"
        variant="error"
      />
    </li>
  );
}
