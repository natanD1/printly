"use client";

import { Check, Search, Trash2 } from "lucide-react";
import type { ChangeEvent, KeyboardEvent, MouseEvent } from "react";
import { useCallback, useId, useMemo, useState } from "react";
import { type Control, useFieldArray, useFormContext } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { NumberField } from "@/components/number-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ProductSchema } from "@/schemas/product-schema";
import type { Filament } from "@/types/filament";
import { formatWeight } from "@/utils/format-weight";

/** Com até essa quantidade a lista inteira cabe à vista; a busca só atrapalha. */
const SEARCH_THRESHOLD = 6;

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      className="size-5 shrink-0 rounded-full ring-1 ring-foreground/15"
      style={{ backgroundColor: color }}
    />
  );
}

interface ProductFilamentRowProps {
  filament: Filament;
  index: number;
  onRemove: (index: number) => void;
}

function ProductFilamentRow({
  filament,
  index,
  onRemove,
}: ProductFilamentRowProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProductSchema>();

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  return (
    <div className="flex items-start gap-2">
      <div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg bg-muted/60 px-2.5 text-sm">
        <ColorSwatch color={filament.colorHex} />
        <span className="truncate">{filament.name}</span>
        <span className="truncate text-muted-foreground text-xs">
          {filament.brand.nameBrand}
        </span>
      </div>

      <div className="w-28">
        <NumberField
          aria-label={`Gramas usadas de ${filament.name}`}
          control={control}
          decimals={2}
          name={`filaments.${index}.gramsUsed`}
          suffix="g"
        />
        <FieldError message={errors.filaments?.[index]?.gramsUsed?.message} />
      </div>

      <Button onClick={handleRemove} size="icon" type="button" variant="ghost">
        <Trash2 className="text-destructive" />
        <span className="sr-only">Remover {filament.name}</span>
      </Button>
    </div>
  );
}

interface FilamentOptionProps {
  filament: Filament;
  isSelected: boolean;
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void;
}

function FilamentOption({
  filament,
  isSelected,
  onToggle,
}: FilamentOptionProps) {
  const isOutOfStock = filament.weight <= 0;

  return (
    <li>
      <button
        aria-pressed={isSelected}
        className={cn(
          "flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
          isSelected && "bg-primary/8"
        )}
        data-id={filament.id}
        onClick={onToggle}
        type="button"
      >
        <ColorSwatch color={filament.colorHex} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{filament.name}</span>
          <span className="truncate text-muted-foreground text-xs">
            {filament.brand.nameBrand}, {filament.type.name}
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 text-xs tabular-nums",
            isOutOfStock ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {isOutOfStock ? "Sem estoque" : formatWeight(filament.weight * 1000)}
        </span>
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-md border",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input"
          )}
        >
          {isSelected ? <Check className="size-3.5" /> : null}
        </span>
      </button>
    </li>
  );
}

interface ProductFilamentPickerProps {
  filaments: Filament[];
}

export function ProductFilamentPicker({
  filaments,
}: ProductFilamentPickerProps) {
  const { control, watch, formState } = useFormContext<ProductSchema>();
  const { fields, append, remove } = useFieldArray({
    control: control as Control<ProductSchema>,
    name: "filaments",
  });
  const [query, setQuery] = useState("");
  const searchId = useId();

  const selectedFilamentIds = watch("filaments").map((f) => f.filamentId);
  const filamentsError = formState.errors.filaments;
  const showSearch = filaments.length > SEARCH_THRESHOLD;

  const visibleFilaments = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) {
      return filaments;
    }
    return filaments.filter((filament) =>
      normalize(
        `${filament.name} ${filament.brand.nameBrand} ${filament.type.name}`
      ).includes(term)
    );
  }, [filaments, query]);

  const handleQueryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value),
    []
  );

  // Enter na busca não pode enviar o formulário do produto.
  const handleQueryKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
      }
    },
    []
  );

  const handleToggleFilament = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const { id } = event.currentTarget.dataset;
      if (!id) {
        return;
      }

      const existingIndex = selectedFilamentIds.indexOf(id);

      if (existingIndex === -1) {
        append({ filamentId: id, gramsUsed: 0 });
      } else {
        remove(existingIndex);
      }
    },
    [append, remove, selectedFilamentIds]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={showSearch ? searchId : undefined}>
          Filamentos usados (por impressão)
        </Label>

        {fields.length ? (
          <div className="flex flex-col gap-1.5">
            {fields.map((field, index) => {
              const filament = filaments.find(
                (item) => item.id === field.filamentId
              );

              return filament ? (
                <ProductFilamentRow
                  filament={filament}
                  index={index}
                  key={field.id}
                  onRemove={remove}
                />
              ) : null;
            })}
          </div>
        ) : null}

        {typeof filamentsError?.message === "string" ? (
          <FieldError message={filamentsError.message} />
        ) : null}
      </div>

      {filaments.length ? (
        <div className="overflow-hidden rounded-lg border border-input">
          {showSearch ? (
            <div className="relative border-input border-b">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-10 rounded-none border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0 dark:bg-transparent"
                id={searchId}
                onChange={handleQueryChange}
                onKeyDown={handleQueryKeyDown}
                placeholder="Buscar por nome, marca ou tipo"
                type="search"
                value={query}
              />
            </div>
          ) : null}

          {visibleFilaments.length ? (
            <ul className="max-h-60 divide-y divide-border overflow-y-auto">
              {visibleFilaments.map((filament) => (
                <FilamentOption
                  filament={filament}
                  isSelected={selectedFilamentIds.includes(filament.id)}
                  key={filament.id}
                  onToggle={handleToggleFilament}
                />
              ))}
            </ul>
          ) : (
            <p className="px-3 py-6 text-center text-muted-foreground text-sm">
              Nenhum filamento com "{query.trim()}".
            </p>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Nenhum filamento cadastrado. Cadastre no Estoque antes de criar o
          produto.
        </p>
      )}
    </div>
  );
}
