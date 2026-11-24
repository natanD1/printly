"use client";

import { Search } from "lucide-react";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ModalCommunication } from "@/components/modal-communication";
import { SideSheetActions, SideSheetContent } from "@/components/side-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetClose } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { UpgradeNotice } from "@/components/upgrade-notice";
import {
  getShowcaseErrorCode,
  getShowcaseErrorStatus,
} from "@/hooks/use-showcase";
import { useShowcaseAvailableProducts } from "@/hooks/use-showcase-available-products";
import { SHOWCASE_MAX_ITEMS_PER_REQUEST } from "@/schemas/showcase-product-ids-schema";
import { PLAN_ERROR_CODES } from "@/types/plan";
import type { ShowcaseAvailableProduct } from "@/types/showcase";
import { formatCurrency } from "@/utils/format-currency";

const SEARCH_DEBOUNCE_MS = 300;
const SKELETON_KEYS = ["skeleton-1", "skeleton-2", "skeleton-3"];

interface ShowcaseAddProductsSheetProps {
  onOpenChange: (open: boolean) => void;
  onSubmit: (productIds: string[]) => Promise<void>;
  open: boolean;
  /** Quantos ainda cabem no plano; `null` = ilimitado. */
  remaining: number | null;
}

interface SubmitError {
  isPlanError: boolean;
  message: string;
}

interface ProductOptionProps {
  disabled: boolean;
  onToggle: (id: string) => void;
  product: ShowcaseAvailableProduct;
  selected: boolean;
}

function ProductOption({
  disabled,
  onToggle,
  product,
  selected,
}: ProductOptionProps) {
  const handleChange = useCallback(() => {
    onToggle(product.id);
  }, [onToggle, product.id]);

  return (
    <li>
      <label
        className={`flex items-center gap-3 rounded-lg border p-3 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted/50"}`}
      >
        <input
          checked={selected}
          className="size-4 cursor-pointer accent-primary disabled:cursor-not-allowed"
          disabled={disabled}
          onChange={handleChange}
          type="checkbox"
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium text-sm">{product.name}</span>
          <span className="text-muted-foreground text-xs">
            {formatCurrency(product.unitSalePrice)} por unidade
          </span>
        </span>
        {product.hasPhoto ? null : <Badge variant="outline">Sem foto</Badge>}
      </label>
    </li>
  );
}

interface ProductListProps {
  /** Já atingiu o que cabe: só dá pra desmarcar. */
  blockNew: boolean;
  hasSearch: boolean;
  isLoading: boolean;
  onToggle: (id: string) => void;
  products: ShowcaseAvailableProduct[];
  selected: Set<string>;
}

function ProductList({
  blockNew,
  hasSearch,
  isLoading,
  onToggle,
  products,
  selected,
}: ProductListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {SKELETON_KEYS.map((key) => (
          <Skeleton className="h-14 w-full" key={key} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-sm">
        {hasSearch
          ? "Nenhum produto encontrado."
          : "Nenhum produto produzido disponível. Marque produtos como produzidos na Home."}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {products.map((product) => {
        const isSelected = selected.has(product.id);

        return (
          <ProductOption
            disabled={!isSelected && blockNew}
            key={product.id}
            onToggle={onToggle}
            product={product}
            selected={isSelected}
          />
        );
      })}
    </ul>
  );
}

function toSubmitError(caughtError: unknown): SubmitError {
  const code = getShowcaseErrorCode(caughtError);
  const isPlanError =
    code === PLAN_ERROR_CODES.limitReached ||
    code === PLAN_ERROR_CODES.featureUnavailable;

  if (getShowcaseErrorStatus(caughtError) === 404) {
    return {
      isPlanError,
      message: "Crie a vitrine antes de adicionar produtos.",
    };
  }

  return {
    isPlanError,
    message:
      caughtError instanceof Error ? caughtError.message : "Erro inesperado",
  };
}

function AddProductsBody({
  onClose,
  onSubmit,
  remaining,
}: {
  onClose: () => void;
  onSubmit: (productIds: string[]) => Promise<void>;
  remaining: number | null;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const [planErrorMessage, setPlanErrorMessage] = useState<string | null>(null);
  const { error, isLoading, products } = useShowcaseAvailableProducts(
    debouncedSearch,
    true
  );

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS
    );

    return () => clearTimeout(timer);
  }, [search]);

  const maxSelectable =
    remaining === null
      ? SHOWCASE_MAX_ITEMS_PER_REQUEST
      : Math.min(remaining, SHOWCASE_MAX_ITEMS_PER_REQUEST);
  const isFull = remaining !== null && remaining <= 0;
  const reachedLimit = selected.size >= maxSelectable;

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
    },
    []
  );

  const handleToggle = useCallback((id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onSubmit([...selected]);
      onClose();
    } catch (caughtError) {
      const failure = toSubmitError(caughtError);

      setPlanErrorMessage(failure.isPlanError ? failure.message : null);
      setSubmitError(failure);
    } finally {
      setIsSubmitting(false);
    }
  }, [onClose, onSubmit, selected]);

  const handleErrorOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setSubmitError(null);
    }
  }, []);

  const visibleSelectedCount = useMemo(
    () => products.filter((product) => selected.has(product.id)).length,
    [products, selected]
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          maxLength={100}
          onChange={handleSearchChange}
          placeholder="Buscar produto pelo nome..."
          value={search}
        />
      </div>

      <div className="flex flex-col gap-1 text-muted-foreground text-xs">
        <span>Só produtos já produzidos aparecem aqui.</span>
        {remaining === null ? null : (
          <span>
            Ainda cabem {Math.max(0, remaining)}{" "}
            {remaining === 1 ? "produto" : "produtos"} no seu plano.
          </span>
        )}
        {selected.size > 0 ? (
          <span>
            {selected.size} selecionado{selected.size === 1 ? "" : "s"}
            {visibleSelectedCount === selected.size
              ? ""
              : " (alguns fora da busca atual)"}
            .
          </span>
        ) : null}
      </div>

      {isFull ? (
        <UpgradeNotice message="Sua vitrine está no limite do plano." />
      ) : null}

      {planErrorMessage ? <UpgradeNotice message={planErrorMessage} /> : null}

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <ProductList
        blockNew={isFull || reachedLimit}
        hasSearch={Boolean(debouncedSearch)}
        isLoading={isLoading}
        onToggle={handleToggle}
        products={products}
        selected={selected}
      />

      <SideSheetActions>
        <SheetClose render={<Button type="button" variant="outline" />}>
          Cancelar
        </SheetClose>
        <Button
          disabled={isSubmitting || selected.size === 0}
          onClick={handleSubmit}
        >
          Adicionar{selected.size > 0 ? ` (${selected.size})` : ""}
        </Button>
      </SideSheetActions>

      <ModalCommunication
        description={submitError?.message}
        extraAction={
          submitError?.isPlanError
            ? { href: "/assinatura", label: "Ver planos" }
            : undefined
        }
        onOpenChange={handleErrorOpenChange}
        open={submitError !== null}
        title="Erro ao adicionar produtos"
        variant="error"
      />
    </div>
  );
}

export function ShowcaseAddProductsSheet({
  onOpenChange,
  onSubmit,
  open,
  remaining,
}: ShowcaseAddProductsSheetProps) {
  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SideSheetContent title="Adicionar produtos à vitrine">
        <AddProductsBody
          onClose={handleClose}
          onSubmit={onSubmit}
          remaining={remaining}
        />
      </SideSheetContent>
    </Sheet>
  );
}
