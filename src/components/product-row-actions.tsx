"use client";

import {
  Eye,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Trash2,
  Undo2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { ProductDetailDialog } from "@/components/product-detail-dialog";
import { ProductFormDialog } from "@/components/product-form-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProductSchema } from "@/schemas/product-schema";
import type { Product } from "@/types/product";

interface ProductRowActionsProps {
  onDelete: (id: string) => Promise<void>;
  onSetProduced: (id: string, isProduced: boolean) => Promise<void>;
  onUpdate: (id: string, data: ProductSchema) => Promise<void>;
  product: Product;
}

interface ActionError {
  message: string;
  title: string;
}

function toErrorMessage(caughtError: unknown): string {
  return caughtError instanceof Error ? caughtError.message : "Erro inesperado";
}

export function ProductRowActions({
  onDelete,
  onSetProduced,
  onUpdate,
  product,
}: ProductRowActionsProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingProduced, setIsTogglingProduced] = useState(false);
  const [actionError, setActionError] = useState<ActionError | null>(null);

  const handleUpdate = useCallback(
    (data: ProductSchema) => onUpdate(product.id, data),
    [product.id, onUpdate]
  );

  const handleOpenView = useCallback(() => {
    setIsViewOpen(true);
  }, []);

  const handleOpenEdit = useCallback(() => {
    setIsEditOpen(true);
  }, []);

  const handleOpenDelete = useCallback(() => {
    setIsDeleteOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete(product.id);
      setIsDeleteOpen(false);
    } catch (caughtError) {
      setActionError({
        message: toErrorMessage(caughtError),
        title: "Erro ao excluir produto",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [product.id, onDelete]);

  // Sem confirmação: a ação é reversível (voltar pra orçamento devolve o filamento).
  const handleToggleProduced = useCallback(async () => {
    setIsTogglingProduced(true);
    try {
      await onSetProduced(product.id, !product.isProduced);
    } catch (caughtError) {
      setActionError({
        message: toErrorMessage(caughtError),
        title: product.isProduced
          ? "Erro ao voltar para orçamento"
          : "Erro ao marcar como produzido",
      });
    } finally {
      setIsTogglingProduced(false);
    }
  }, [product.id, product.isProduced, onSetProduced]);

  const handleErrorOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setActionError(null);
    }
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon-xs" variant="ghost" />}>
          <span className="sr-only">Abrir ações</span>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={handleOpenView}>
            <Eye />
            Visualizar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenEdit}>
            <Pencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isTogglingProduced}
            onClick={handleToggleProduced}
          >
            {product.isProduced ? <Undo2 /> : <PackageCheck />}
            {product.isProduced
              ? "Voltar para orçamento"
              : "Marcar como produzido"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenDelete} variant="destructive">
            <Trash2 />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProductDetailDialog
        onOpenChange={setIsViewOpen}
        open={isViewOpen}
        product={product}
      />

      <ProductFormDialog
        onOpenChange={setIsEditOpen}
        onSubmit={handleUpdate}
        open={isEditOpen}
        product={product}
      />

      <ModalCommunication
        confirmLabel="Excluir"
        description={`Isso vai remover "${product.productName}" permanentemente.`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onOpenChange={setIsDeleteOpen}
        open={isDeleteOpen}
        title="Excluir produto?"
        variant="warning"
      />

      <ModalCommunication
        description={actionError?.message}
        onOpenChange={handleErrorOpenChange}
        open={actionError !== null}
        title={actionError?.title ?? ""}
        variant="error"
      />
    </>
  );
}
