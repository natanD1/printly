"use client";

import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { FieldError } from "@/components/field-error";
import { SideSheetActions, SideSheetContent } from "@/components/side-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useQuoteBranding } from "@/hooks/use-quote-branding";
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
  const {
    isReady: isBrandingReady,
    showBrandingFooter,
    showCompanyLogo,
  } = useQuoteBranding();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [pdf, setPdf] = useState<PdfState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [webLink, setWebLink] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      return;
    }
    setCustomerName("");
    setCustomerPhone("");
    setPhoneError(undefined);
    setWebLink(null);
    setNotice(null);
    setPdf({ status: "loading" });
    setAttempt(0);
  }, [open]);

  // Pré-gera o PDF em segundo plano pra o clique em "Enviar" ser síncrono
  // (o download e a abertura do app precisam do gesto do usuário).
  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` só força nova tentativa.
  useEffect(() => {
    // Espera empresa e plano: logo/rodapé dependem dele e não podem piscar.
    if (!open || isCompanyLoading || !isBrandingReady) {
      return;
    }

    let cancelled = false;
    setPdf({ status: "loading" });

    generateQuotePdf(quote, company, { showBrandingFooter, showCompanyLogo })
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
      .catch((caughtError: unknown) => {
        console.error("Falha ao gerar o PDF do orçamento", caughtError);
        if (!cancelled) {
          setPdf({ status: "error" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    open,
    isCompanyLoading,
    isBrandingReady,
    showBrandingFooter,
    showCompanyLogo,
    quote,
    company,
    attempt,
  ]);

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

  // Sem await no clique: preserva a ativação do usuário pro download e o app.
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

    setNotice(null);

    const normalized = normalizePhone(parsed.data.customerPhone ?? "");
    const message = buildQuoteMessage({
      customerName: parsed.data.customerName,
      productName: quote.productName,
      quantity: quote.quantity,
      total: quote.salePrice,
    });

    // Sempre WhatsApp direto (sem folha de compartilhar do sistema): baixa o
    // PDF e abre a conversa. Celular usa wa.me (o sistema abre o app);
    // desktop usa whatsapp:// pra abrir o app instalado, não a página do wa.me.
    const phone = normalized.ok ? normalized.phone : null;
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    downloadBlob(file, file.name);
    window.location.href = buildWhatsappLink(
      message,
      phone,
      isTouchDevice ? "universal" : "app"
    );
    setWebLink(buildWhatsappLink(message, phone, "web"));
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

          {notice ? <p className="text-sm">{notice}</p> : null}
          {webLink ? (
            <a
              className="cursor-pointer text-sm underline underline-offset-4"
              href={webLink}
              rel="noopener noreferrer"
              target="_blank"
            >
              O app não abriu? Abrir no WhatsApp Web
            </a>
          ) : null}
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
