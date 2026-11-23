"use client";

import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { FieldError } from "@/components/field-error";
import { SideSheetActions, SideSheetContent } from "@/components/side-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useQuoteCompany } from "@/hooks/use-quote-company";
import { quoteShareSchema } from "@/schemas/quote-share-schema";
import type { QuoteData } from "@/types/quote";
import { buildQuoteMessage } from "@/utils/build-quote-message";
import { buildWhatsappLink } from "@/utils/build-whatsapp-link";
import { formatPhoneMask } from "@/utils/format-phone";
import {
  downloadBlob,
  generateQuotePdf,
  quoteFileName,
} from "@/utils/generate-quote-pdf";
import { normalizePhone } from "@/utils/normalize-phone";

interface QuoteWhatsappSheetProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  quote: QuoteData;
}

type PdfState =
  | { status: "loading" }
  | { status: "ready"; file: File }
  | { status: "error" };

const FALLBACK_NOTICE =
  "PDF baixado: arraste o arquivo para a conversa do WhatsApp";

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/**
 * Nome e telefone do cliente vivem só neste estado: nunca vão pra API,
 * localStorage nem log. Tudo é descartado quando o painel fecha.
 */
export function QuoteWhatsappSheet({
  onOpenChange,
  open,
  quote,
}: QuoteWhatsappSheetProps) {
  const { company, isLoading: isCompanyLoading } = useQuoteCompany();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [pdf, setPdf] = useState<PdfState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [shareError, setShareError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      return;
    }
    setCustomerName("");
    setCustomerPhone("");
    setPhoneError(undefined);
    setShareError(null);
    setNotice(null);
    setPdf({ status: "loading" });
    setAttempt(0);
  }, [open]);

  // Pré-gera o PDF em segundo plano pra o clique em "Enviar" ser síncrono
  // (navigator.share exige gesto do usuário recente).
  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` só força nova tentativa.
  useEffect(() => {
    if (!open || isCompanyLoading) {
      return;
    }

    let cancelled = false;
    setPdf({ status: "loading" });

    generateQuotePdf(quote, company)
      .then((blob) => {
        if (!cancelled) {
          setPdf({
            file: new File([blob], quoteFileName(quote.productName), {
              type: "application/pdf",
            }),
            status: "ready",
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPdf({ status: "error" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, isCompanyLoading, quote, company, attempt]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleRetry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCustomerName(event.target.value);
    },
    []
  );

  const handlePhoneChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCustomerPhone(formatPhoneMask(event.target.value));
      setPhoneError(undefined);
    },
    []
  );

  // Sem await antes de navigator.share: preserva a ativação do clique.
  const handleSend = useCallback(() => {
    if (pdf.status !== "ready") {
      return;
    }
    const { file } = pdf;

    const parsed = quoteShareSchema.safeParse({ customerName, customerPhone });
    if (!parsed.success) {
      setPhoneError(parsed.error.issues[0]?.message);
      return;
    }

    setShareError(null);
    setNotice(null);

    const normalized = normalizePhone(parsed.data.customerPhone ?? "");
    const message = buildQuoteMessage({
      customerName: parsed.data.customerName,
      productName: quote.productName,
      quantity: quote.quantity,
      total: quote.salePrice,
    });

    if (
      typeof navigator.share === "function" &&
      navigator.canShare?.({ files: [file] })
    ) {
      const reportError = (error: unknown) => {
        if (!isAbortError(error)) {
          setShareError("Não foi possível compartilhar. Tente novamente.");
        }
      };
      try {
        navigator
          .share({ files: [file], text: message, title: file.name })
          .catch(reportError);
      } catch (error) {
        reportError(error);
      }
      return;
    }

    const phone = normalized.ok ? normalized.phone : null;
    window.open(
      buildWhatsappLink(message, phone),
      "_blank",
      "noopener,noreferrer"
    );
    downloadBlob(file, file.name);
    setNotice(FALLBACK_NOTICE);
  }, [pdf, customerName, customerPhone, quote]);

  const isReady = pdf.status === "ready";

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SideSheetContent title="Enviar por WhatsApp">
        <div className="flex flex-col gap-4 pb-6">
          <p className="text-muted-foreground text-sm">
            Orçamento de <strong>{quote.productName}</strong>. Os dados do
            cliente não são salvos.
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quote-customer-name">Nome do cliente</Label>
            <Input
              autoComplete="off"
              id="quote-customer-name"
              onChange={handleNameChange}
              placeholder="Opcional"
              value={customerName}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quote-customer-phone">Telefone do cliente</Label>
            <Input
              autoComplete="off"
              id="quote-customer-phone"
              inputMode="tel"
              onChange={handlePhoneChange}
              placeholder="(11) 91234-5678"
              value={customerPhone}
            />
            <FieldError message={phoneError} />
          </div>

          {pdf.status === "loading" ? (
            <p className="flex items-center gap-2 text-muted-foreground text-sm">
              <Spinner />
              Gerando PDF…
            </p>
          ) : null}

          {pdf.status === "error" ? (
            <div className="flex flex-col items-start gap-2">
              <FieldError message="Não foi possível gerar o PDF do orçamento." />
              <Button onClick={handleRetry} size="sm" variant="outline">
                Tentar novamente
              </Button>
            </div>
          ) : null}

          <FieldError message={shareError ?? undefined} />
          {notice ? <p className="text-sm">{notice}</p> : null}
        </div>

        <SideSheetActions>
          <Button onClick={handleClose} type="button" variant="outline">
            Fechar
          </Button>
          <Button disabled={!isReady} onClick={handleSend} type="button">
            Enviar
          </Button>
        </SideSheetActions>
      </SideSheetContent>
    </Sheet>
  );
}
