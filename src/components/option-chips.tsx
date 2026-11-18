"use client";

import { type MouseEvent, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface OptionChip {
  id: string;
  /** Base64 sem prefixo `data:`; sem imagem mostra um placeholder. */
  image?: string | null;
  label: string;
}

interface OptionChipsProps {
  className?: string;
  emptyMessage: string;
  onSelect: (id: string) => void;
  options: OptionChip[];
  value: string;
}

function ChipImage({ image }: { image: string | null }) {
  if (!image) {
    return <div className="size-8 shrink-0 rounded-md bg-muted" />;
  }

  return (
    // biome-ignore lint/performance/noImgElement: preview de base64 vindo da API, sem otimização de imagem aplicável
    <img
      alt=""
      className="size-8 shrink-0 rounded-md object-cover"
      height={32}
      src={`data:image/png;base64,${image}`}
      width={32}
    />
  );
}

/** Escolha única em chips (mesmo visual do seletor de marca/tipo de filamento). */
export function OptionChips({
  className,
  emptyMessage,
  onSelect,
  options,
  value,
}: OptionChipsProps) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const { id } = event.currentTarget.dataset;
      if (id) {
        onSelect(id);
      }
    },
    [onSelect]
  );

  if (!options.length) {
    return <p className="text-muted-foreground text-sm">{emptyMessage}</p>;
  }

  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3", className)}>
      {options.map((option) => (
        <button
          aria-pressed={value === option.id}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent",
            value === option.id
              ? "border-primary ring-1 ring-primary"
              : "border-input"
          )}
          data-id={option.id}
          key={option.id}
          onClick={handleClick}
          type="button"
        >
          {option.image === undefined ? null : (
            <ChipImage image={option.image} />
          )}
          <span className="truncate">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
