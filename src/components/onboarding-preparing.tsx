"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const PREPARING_MESSAGES = [
  "Configurando sua empresa",
  "Calculando custos de energia",
  "Ajustando sua impressora",
  "Organizando seu estoque",
] as const;

const MESSAGE_INTERVAL_MS = 1000;
const MIN_DURATION_MS = 3000;

export interface OnboardingPreparingProps {
  error: string | null;
  isDone: boolean;
  onFinished: () => void;
  onRetry: () => void;
}

export function OnboardingPreparing({
  error,
  isDone,
  onFinished,
  onRetry,
}: OnboardingPreparingProps) {
  const hasError = error !== null;
  const [messageIndex, setMessageIndex] = useState(0);

  const attemptStartRef = useRef<number | null>(null);
  const finishedCalledRef = useRef(false);
  const onFinishedRef = useRef(onFinished);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    if (hasError) {
      attemptStartRef.current = null;
      return;
    }

    attemptStartRef.current = Date.now();
  }, [hasError]);

  useEffect(() => {
    if (hasError) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PREPARING_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasError]);

  useEffect(() => {
    if (hasError || !isDone || finishedCalledRef.current) {
      return;
    }

    const startedAt = attemptStartRef.current ?? Date.now();
    const remaining = Math.max(0, MIN_DURATION_MS - (Date.now() - startedAt));

    if (remaining === 0) {
      finishedCalledRef.current = true;
      onFinishedRef.current();
      return;
    }

    // O cleanup cancela o timeout se o efeito rodar de novo, então ele dispara uma vez só.
    const timeoutId = window.setTimeout(() => {
      finishedCalledRef.current = true;
      onFinishedRef.current();
    }, remaining);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasError, isDone]);

  const handleRetry = useCallback(() => {
    setMessageIndex(0);
    onRetry();
  }, [onRetry]);

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center bg-background px-6 py-12 text-center text-foreground">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div>
          <Image
            alt="Printly"
            className="h-10 w-auto dark:hidden"
            height={256}
            priority
            src="/printly-logo-horizontal.svg"
            width={916}
          />
          <Image
            alt="Printly"
            className="hidden h-10 w-auto dark:block"
            height={256}
            priority
            src="/printly-logo-horizontal-negativo.svg"
            width={916}
          />
        </div>

        <h1 className="font-semibold text-2xl tracking-tight">
          Preparando tudo
        </h1>

        {hasError ? (
          <div className="flex w-full flex-col items-center gap-4">
            <p className="text-pretty text-destructive text-sm" role="alert">
              {error}
            </p>
            <Button onClick={handleRetry} type="button">
              Tentar de novo
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              aria-hidden="true"
              className="size-10 rounded-full border-[3px] border-primary/20 border-t-primary motion-safe:animate-spin"
            />
            <p
              aria-live="polite"
              className="motion-safe:fade-in min-h-6 text-muted-foreground text-sm motion-safe:animate-in"
              key={messageIndex}
            >
              {PREPARING_MESSAGES[messageIndex]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
