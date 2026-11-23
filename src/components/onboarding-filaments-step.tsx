"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { FilamentForm } from "@/components/filament-form";
import { ModalCommunication } from "@/components/modal-communication";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFilamentBrands } from "@/hooks/use-filament-brands";
import { useFilamentTypes } from "@/hooks/use-filament-types";
import { useFilaments } from "@/hooks/use-filaments";
import type { FilamentSchema } from "@/schemas/filament-schema";
import type { Filament } from "@/types/filament";
import type { OnboardingStepProps } from "@/types/onboarding";

interface ErrorModalState {
  description: string;
  title: string;
}

interface SavedFilamentsListProps {
  disabled: boolean;
  filaments: Filament[];
  onDeleteRequest: (event: MouseEvent<HTMLButtonElement>) => void;
}

function SavedFilamentsList({
  disabled,
  filaments,
  onDeleteRequest,
}: SavedFilamentsListProps) {
  if (filaments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium text-muted-foreground text-xs">
        Filamentos cadastrados ({filaments.length})
      </p>
      <ul className="flex flex-col gap-2">
        {filaments.map((filament) => {
          const details = [filament.brand.nameBrand, filament.type.name]
            .filter(Boolean)
            .join(" · ");

          return (
            <li
              className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2.5"
              key={filament.id}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="size-6 shrink-0 rounded-full ring-1 ring-foreground/10"
                  style={{ backgroundColor: filament.colorHex }}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium text-sm">
                    {filament.name}
                  </span>
                  {details ? (
                    <span className="truncate text-muted-foreground text-xs">
                      {details}
                    </span>
                  ) : null}
                </div>
              </div>
              <Button
                aria-label="Remover filamento"
                className="shrink-0 cursor-pointer"
                data-id={filament.id}
                disabled={disabled}
                onClick={onDeleteRequest}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <Trash2 className="text-destructive" />
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface EmptyFilamentsCatalogProps {
  onBack?: () => void;
  onSkip: () => void;
}

function EmptyFilamentsCatalog({ onBack, onSkip }: EmptyFilamentsCatalogProps) {
  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-lg border bg-muted/40 p-4 text-muted-foreground text-sm">
        Ainda não há marcas ou tipos de filamento disponíveis no catálogo. Você
        pode pular esta etapa e cadastrar seus filamentos depois, em Filamentos.
      </p>
      <div className="flex w-full items-center justify-between gap-3 border-t pt-4">
        {onBack ? (
          <Button onClick={onBack} type="button" variant="outline">
            Voltar
          </Button>
        ) : null}
        <Button
          className={onBack ? undefined : "ml-auto"}
          onClick={onSkip}
          type="button"
        >
          Pular
        </Button>
      </div>
    </div>
  );
}

interface FilamentsStepFooterProps {
  disabled: boolean;
  onBack?: () => void;
  onDone: () => void;
  onSkip: () => void;
}

function FilamentsStepFooter({
  disabled,
  onBack,
  onDone,
  onSkip,
}: FilamentsStepFooterProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2 border-t pt-4">
      {onBack ? (
        <Button
          disabled={disabled}
          onClick={onBack}
          type="button"
          variant="outline"
        >
          Voltar
        </Button>
      ) : null}
      <div
        className={
          onBack ? "flex items-center gap-2" : "ml-auto flex items-center gap-2"
        }
      >
        <Button
          disabled={disabled}
          onClick={onSkip}
          type="button"
          variant="ghost"
        >
          Pular
        </Button>
        <Button disabled={disabled} onClick={onDone} type="button">
          Concluir
        </Button>
      </div>
    </div>
  );
}

export function OnboardingFilamentsStep({
  onBack,
  onDone,
  onSkip,
}: OnboardingStepProps) {
  const {
    createFilament,
    deleteFilament,
    filaments,
    isLoading: isFilamentsLoading,
  } = useFilaments();
  const { filamentBrands, isLoading: isBrandsLoading } = useFilamentBrands();
  const { filamentTypes, isLoading: isTypesLoading } = useFilamentTypes();

  const [formKey, setFormKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filamentToDelete, setFilamentToDelete] = useState<Filament | null>(
    null
  );
  const [errorModal, setErrorModal] = useState<ErrorModalState | null>(null);

  const isSavingRef = useRef<boolean>(false as boolean);
  const isDeletingRef = useRef<boolean>(false as boolean);

  const isInitialLoading =
    isFilamentsLoading || isBrandsLoading || isTypesLoading;
  const isBusy = isSaving || isDeleting;

  const hasActiveCatalog = useMemo(
    () =>
      filamentBrands.some((brand) => brand.isActive) &&
      filamentTypes.some((type) => type.isActive),
    [filamentBrands, filamentTypes]
  );

  const handleCreateFilament = useCallback(
    async (data: FilamentSchema) => {
      if (isSavingRef.current) {
        return;
      }
      isSavingRef.current = true;
      setIsSaving(true);
      try {
        await createFilament(data);
        setFormKey((current) => current + 1);
      } catch (caughtError) {
        setErrorModal({
          description:
            caughtError instanceof Error
              ? caughtError.message
              : "Tente novamente em alguns instantes.",
          title: "Não foi possível salvar o filamento",
        });
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
      }
    },
    [createFilament]
  );

  const handleDeleteRequest = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const { id } = event.currentTarget.dataset;
      const target = filaments.find((item) => item.id === id) ?? null;
      setFilamentToDelete(target);
    },
    [filaments]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!filamentToDelete || isDeletingRef.current) {
      return;
    }
    isDeletingRef.current = true;
    setIsDeleting(true);
    try {
      await deleteFilament(filamentToDelete.id);
      setFilamentToDelete(null);
    } catch (caughtError) {
      setFilamentToDelete(null);
      setErrorModal({
        description:
          caughtError instanceof Error
            ? caughtError.message
            : "Tente novamente em alguns instantes.",
        title: "Não foi possível remover o filamento",
      });
    } finally {
      isDeletingRef.current = false;
      setIsDeleting(false);
    }
  }, [deleteFilament, filamentToDelete]);

  const handleDeleteModalOpenChange = useCallback((isOpen: boolean) => {
    if (!(isOpen || isDeletingRef.current)) {
      setFilamentToDelete(null);
    }
  }, []);

  const handleErrorOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setErrorModal(null);
    }
  }, []);

  const handleSkip = useCallback(() => {
    const action = onSkip ?? onDone;
    action();
  }, [onDone, onSkip]);

  const renderFormActions = useCallback(
    ({ isSubmitting }: { isSubmitting: boolean }) => (
      <div className="flex justify-end pt-1">
        <Button
          className="w-full sm:w-auto"
          disabled={isSubmitting || isBusy}
          type="submit"
          variant="secondary"
        >
          {isSubmitting || isSaving ? <Spinner /> : <Plus />}
          Adicionar filamento
        </Button>
      </div>
    ),
    [isBusy, isSaving]
  );

  let content: ReactNode;
  if (isInitialLoading) {
    content = (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  } else if (hasActiveCatalog) {
    content = (
      <div className="flex flex-col gap-6">
        <SavedFilamentsList
          disabled={isBusy}
          filaments={filaments}
          onDeleteRequest={handleDeleteRequest}
        />

        <FilamentForm
          key={formKey}
          onSubmit={handleCreateFilament}
          renderActions={renderFormActions}
          submitLabel="Adicionar filamento"
        />

        <FilamentsStepFooter
          disabled={isBusy}
          onBack={onBack}
          onDone={onDone}
          onSkip={handleSkip}
        />
      </div>
    );
  } else {
    content = <EmptyFilamentsCatalog onBack={onBack} onSkip={handleSkip} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-xl tracking-tight">
          Seus filamentos (opcional)
        </h2>
        <p className="text-muted-foreground text-sm">
          Adicione os filamentos que você já tem em estoque. Você pode cadastrar
          quantos quiser agora ou pular esta etapa.
        </p>
      </div>

      {content}

      <ModalCommunication
        confirmLabel="Remover"
        description={
          filamentToDelete
            ? `Isso vai remover "${filamentToDelete.name}" do estoque.`
            : undefined
        }
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onOpenChange={handleDeleteModalOpenChange}
        open={filamentToDelete !== null}
        title="Remover filamento?"
        variant="warning"
      />

      <ModalCommunication
        description={errorModal?.description}
        onOpenChange={handleErrorOpenChange}
        open={errorModal !== null}
        title={errorModal?.title ?? ""}
        variant="error"
      />
    </div>
  );
}
