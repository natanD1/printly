"use client";

import { Check, Copy, ExternalLink, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { buildWhatsappLink } from "@/utils/build-whatsapp-link";

const COPIED_FEEDBACK_MS = 2000;

interface ShowcaseLinkCardProps {
  disabled: boolean;
  isPublished: boolean;
  onPublishedChange: (isPublished: boolean) => void;
  origin: string;
  slug: string;
}

export function ShowcaseLinkCard({
  disabled,
  isPublished,
  onPublishedChange,
  origin,
  slug,
}: ShowcaseLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const link = `${origin}/loja/${slug}`;

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
    },
    []
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      setCopied(false);
    }
  }, [link]);

  const handleShareWhatsapp = useCallback(() => {
    window.open(
      buildWhatsappLink(`Confira minha vitrine: ${link}`, null, "universal"),
      "_blank",
      "noopener,noreferrer"
    );
  }, [link]);

  const handlePublishedChange = useCallback(
    (checked: boolean) => {
      onPublishedChange(checked);
    },
    [onPublishedChange]
  );

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-medium text-sm">Link público da vitrine</span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 break-all rounded-lg border bg-muted/50 px-2.5 py-1.5 text-sm">
              {link}
            </code>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleCopy} variant="outline">
                {copied ? <Check /> : <Copy />}
                {copied ? "Copiado" : "Copiar link"}
              </Button>
              <Button
                nativeButton={false}
                render={
                  <a href={link} rel="noopener noreferrer" target="_blank" />
                }
                variant="outline"
              >
                <ExternalLink />
                Abrir
              </Button>
              <Button onClick={handleShareWhatsapp} variant="outline">
                <MessageCircle />
                Compartilhar no WhatsApp
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            O endereço segue o nome da empresa. Para mudar, altere o nome em{" "}
            <Link
              className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline"
              href="/configuracoes"
            >
              Configurações
            </Link>
            ; links antigos deixam de funcionar.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="showcase-published">
              {isPublished ? "Vitrine publicada" : "Vitrine despublicada"}
            </Label>
            <span className="text-muted-foreground text-xs">
              {isPublished
                ? "Qualquer pessoa com o link vê os produtos visíveis."
                : "O link mostra que a vitrine está indisponível."}
            </span>
          </div>
          <Switch
            checked={isPublished}
            disabled={disabled}
            id="showcase-published"
            onCheckedChange={handlePublishedChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
