"use client";

import { ChevronDown, ChevronUp, ImageOff, Search } from "lucide-react";
import {
  type ChangeEvent,
  type MouseEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface OptionCardItem {
  id: string;
  /** Base64 sem prefixo `data:`; `undefined` oculta o espaço de imagem, `null` mostra placeholder. */
  image?: string | null;
  label: string;
}

interface OptionCardPickerProps {
  className?: string;
  columns?: 2 | 3;
  emptyMessage: string;
  emptySearchMessage?: string;
  imageSize?: "md" | "lg";
  label?: string;
  onSelect: (id: string) => void;
  options: OptionCardItem[];
  searchPlaceholder?: string;
  value: string;
}

function CardImage({
  image,
  imageSize,
  label,
}: {
  image: string | null;
  imageSize: "md" | "lg";
  label: string;
}) {
  const isLarge = imageSize === "lg";
  const boxClass = isLarge ? "h-24 w-full" : "size-12 shrink-0";

  if (!image) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-muted text-muted-foreground",
          boxClass
        )}
      >
        <ImageOff
          aria-hidden="true"
          className={isLarge ? "size-6" : "size-4"}
        />
      </div>
    );
  }

  return (
    // biome-ignore lint/performance/noImgElement: preview de base64 vindo da API, sem otimização de imagem aplicável
    <img
      alt={label}
      className={cn(
        "rounded-lg bg-muted/40 object-contain",
        isLarge ? "h-24 w-full p-1.5" : "size-12 shrink-0 p-1"
      )}
      height={isLarge ? 96 : 48}
      src={`data:image/png;base64,${image}`}
      width={isLarge ? 120 : 48}
    />
  );
}

export function OptionCardPicker({
  className,
  columns = 3,
  emptyMessage,
  emptySearchMessage = "Nenhum resultado encontrado.",
  imageSize = "md",
  label,
  onSelect,
  options,
  searchPlaceholder = "Pesquisar...",
  value,
}: OptionCardPickerProps) {
  const [search, setSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
    },
    []
  );

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((expanded) => !expanded);
  }, []);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const { id } = event.currentTarget.dataset;
      if (id) {
        onSelect(id);
      }
    },
    [onSelect]
  );

  const normalizedSearch = search.trim().toLowerCase();

  const filteredOptions = useMemo(() => {
    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedSearch)
    );
  }, [normalizedSearch, options]);

  // Na edição, garante que o item já selecionado fique visível mesmo recolhido na 1ª linha.
  const orderedOptions = useMemo(() => {
    if (!value || normalizedSearch) {
      return filteredOptions;
    }

    const selectedIndex = filteredOptions.findIndex(
      (option) => option.id === value
    );

    if (selectedIndex < columns) {
      return filteredOptions;
    }

    const selected = filteredOptions[selectedIndex];
    return [
      selected,
      ...filteredOptions.slice(0, selectedIndex),
      ...filteredOptions.slice(selectedIndex + 1),
    ];
  }, [columns, filteredOptions, normalizedSearch, value]);

  if (options.length === 0) {
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        {label ? <Label>{label}</Label> : null}
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const canExpand = !normalizedSearch && orderedOptions.length > columns;
  const visibleOptions =
    isExpanded || normalizedSearch
      ? orderedOptions
      : orderedOptions.slice(0, columns);
  const hiddenCount = orderedOptions.length - columns;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        {label ? <Label>{label}</Label> : <span />}
        <div className="relative w-44 sm:w-52">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="h-7 pl-8 text-xs md:text-xs"
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            type="search"
            value={search}
          />
        </div>
      </div>

      {visibleOptions.length > 0 ? (
        <div
          className={cn(
            "grid gap-2",
            columns === 2 ? "grid-cols-2" : "grid-cols-3"
          )}
        >
          {visibleOptions.map((option) => {
            const isSelected = value === option.id;

            return (
              <button
                aria-pressed={isSelected}
                className={cn(
                  "flex min-h-14 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border bg-card p-2.5 text-center transition-colors hover:bg-accent/50",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-input"
                )}
                data-id={option.id}
                key={option.id}
                onClick={handleClick}
                type="button"
              >
                {option.image === undefined ? null : (
                  <CardImage
                    image={option.image}
                    imageSize={imageSize}
                    label={option.label}
                  />
                )}
                <span className="line-clamp-2 w-full font-medium text-xs leading-tight">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="py-3 text-center text-muted-foreground text-xs">
          {emptySearchMessage}
        </p>
      )}

      {canExpand ? (
        <Button
          className="w-full text-muted-foreground"
          onClick={handleToggleExpand}
          size="sm"
          type="button"
          variant="ghost"
        >
          {isExpanded ? (
            <>
              <ChevronUp />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown />
              Ver mais ({hiddenCount})
            </>
          )}
        </Button>
      ) : null}
    </div>
  );
}
