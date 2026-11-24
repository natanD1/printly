"use client";

import {
  Eye,
  FileText,
  MessageCircle,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Store,
  Trash2,
  Undo2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { ProductDetailDialog } from "@/components/product-detail-dialog";
import { ProductFormDialog } from "@/components/product-form-dialog";
import { QuoteWhatsappSheet } from "@/components/quote-whatsapp-sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEntitlement } from "@/hooks/use-entitlement";
import { useQuoteBranding } from "@/hooks/use-quote-branding";
import { useQuoteCompany } from "@/hooks/use-quote-company";
import { getShowcaseErrorStatus, useShowcase } from "@/hooks/use-showcase";
import type { ProductSchema } from "@/schemas/product-schema";
import type { Product } from "@/types/product";
import {
  downloadBlob,
  generateQuotePdf,
  quoteFileName,
} from "@/utils/generate-quote-pdf";
import { toQuoteData } from "@/utils/to-quote-data";

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
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { company, isLoading: isCompanyLoading } = useQuoteCompany();
  const {
    isReady: isBrandingReady,
    showBrandingFooter,
    showCompanyLogo,
  } = useQuoteBranding();
  const quote = useMemo(() => toQuoteData(product), [product]);
  const [actionError, setActionError] = useState<ActionError | null>(null);
  const router = useRouter();
  const { enabled: isShowcaseEnabled } = useEntitlement("ShowcaseEnabled");
  const canPublishToShowcase = product.isProduced && isShowcaseEnabled;
  const { addItems, showcase } = useShowcase({ enabled: canPublishToShowcase });
  const [isPublishingToShowcase, setIsPublishingToShowcase] = useState(false);
  const [isPublishedToShowcase, setIsPublishedToShowcase] = useState(false);

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

  // Sem vitrine ainda (ou 404 do backend), leva pra tela de criação.
  const handlePublishToShowcase = useCallback(async () => {
    if (showcase?.exists === false) {
      router.push("/vitrine");
      return;
    }

    setIsPublishingToShowcase(true);
    try {
      await addItems([product.id]);
      setIsPublishedToShowcase(true);
    } catch (caughtError) {
      if (getShowcaseErrorStatus(caughtError) === 404) {
        router.push("/vitrine");
        return;
      }

      setActionError({
        message: toErrorMessage(caughtError),
        title: "Erro ao publicar na vitrine",
      });
    } finally {
      setIsPublishingToShowcase(false);
    }
  }, [addItems, product.id, router, showcase]);

  const handlePublishedOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setIsPublishedToShowcase(false);
    }
  }, []);

  const handleOpenWhatsapp = useCallback(() => {
    setIsWhatsappOpen(true);
  }, []);

  const handleGeneratePdf = useCallback(async () => {
    setIsGeneratingPdf(true);
    try {
      const blob = await generateQuotePdf(quote, company, {
        showBrandingFooter,
        showCompanyLogo,
      });
      downloadBlob(blob, quoteFileName(quote.productName));
    } catch (caughtError) {
      console.error("Falha ao gerar o PDF do orçamento", caughtError);
      setActionError({
        message: "Não foi possível gerar o PDF. Tente novamente.",
        title: "Erro ao gerar orçamento",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [quote, company, showBrandingFooter, showCompanyLogo]);

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
        <DropdownMenuContent align="start" className="w-auto whitespace-nowrap">
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
          <DropdownMenuItem
            disabled={isGeneratingPdf || isCompanyLoading || !isBrandingReady}
            onClick={handleGeneratePdf}
          >
            <FileText />
            {isGeneratingPdf ? "Gerando PDF…" : "Gerar orçamento (PDF)"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenWhatsapp}>
            <MessageCircle />
            Enviar por WhatsApp
          </DropdownMenuItem>
          {canPublishToShowcase ? (
            <DropdownMenuItem
              disabled={isPublishingToShowcase}
              onClick={handlePublishToShowcase}
            >
              <Store />
              Publicar na vitrine
            </DropdownMenuItem>
          ) : null}
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

      <QuoteWhatsappSheet
        onOpenChange={setIsWhatsappOpen}
        open={isWhatsappOpen}
        quote={quote}
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
        description={`"${product.productName}" foi para a vitrine. Ele só aparece ao público se a vitrine estiver publicada e dentro do limite do plano.`}
        extraAction={{ href: "/vitrine", label: "Ver vitrine" }}
        onOpenChange={handlePublishedOpenChange}
        open={isPublishedToShowcase}
        title="Produto publicado na vitrine"
        variant="success"
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
