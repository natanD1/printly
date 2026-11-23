"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { NumberField } from "@/components/number-field";
import { SideSheetActions } from "@/components/side-sheet";
import { SwitchField } from "@/components/switch-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetClose } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { usePlanCatalog } from "@/hooks/use-plan-catalog";
import { type PlanSchema, planSchema } from "@/schemas/plan-schema";
import type {
  EntitlementDefinition,
  Plan,
  SavePlanPayload,
} from "@/types/plan";

interface RuleState {
  enabled: boolean;
  /** Texto do input de limite (vazio = não informado). */
  limit: string;
  unlimited: boolean;
}

interface PlanFormProps {
  onSubmit: (payload: SavePlanPayload) => Promise<void>;
  plan?: Plan;
  submitLabel: string;
}

const INTEGER_PATTERN = /^\d+$/;

const DEFAULT_PLAN_HINT =
  "Para trocar o plano padrão, marque outro plano como padrão.";

const DEFAULT_PLAN_PUBLIC_HINT =
  "O plano padrão sempre aparece na página de planos.";

const EMPTY_VALUES: PlanSchema = {
  description: "",
  isActive: true,
  isDefault: false,
  isPublic: true,
  monthlyPrice: 0,
  name: "",
  sortOrder: 0,
};

function buildDefaultValues(plan?: Plan): PlanSchema {
  if (!plan) {
    return EMPTY_VALUES;
  }

  return {
    description: plan.description ?? "",
    isActive: plan.isActive,
    isDefault: plan.isDefault,
    isPublic: plan.isDefault || plan.isPublic,
    monthlyPrice: plan.monthlyPrice,
    name: plan.name,
    sortOrder: plan.sortOrder,
  };
}

/** Chave ausente no plano = limite ilimitado / recurso desligado. */
function buildInitialRule(plan: Plan | undefined, key: string): RuleState {
  const entry = plan?.entitlements.find((item) => item.key === key);
  const intValue = entry?.intValue ?? null;

  return {
    enabled: entry?.boolValue === true,
    limit: intValue === null ? "" : String(intValue),
    unlimited: intValue === null,
  };
}

function groupCatalog(
  catalog: EntitlementDefinition[]
): [string, EntitlementDefinition[]][] {
  const groups = new Map<string, EntitlementDefinition[]>();

  for (const definition of catalog) {
    const items = groups.get(definition.group) ?? [];
    items.push(definition);
    groups.set(definition.group, items);
  }

  return [...groups.entries()];
}

function parseLimit(text: string): number | null {
  if (!INTEGER_PATTERN.test(text.trim())) {
    return null;
  }

  return Number(text.trim());
}

interface LimitRuleProps {
  definition: EntitlementDefinition;
  error?: string;
  onChange: (key: string, rule: RuleState) => void;
  rule: RuleState;
}

function LimitRule({ definition, error, onChange, rule }: LimitRuleProps) {
  const inputId = `rule-${definition.key}`;

  const handleLimitChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(definition.key, { ...rule, limit: event.target.value });
    },
    [definition.key, onChange, rule]
  );

  const handleUnlimitedChange = useCallback(
    (checked: boolean) => {
      onChange(definition.key, {
        ...rule,
        limit: checked ? "" : rule.limit,
        unlimited: checked,
      });
    },
    [definition.key, onChange, rule]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={inputId}>{definition.label}</Label>
        <span className="text-muted-foreground text-xs">
          {definition.description}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Input
          className="max-w-32"
          disabled={rule.unlimited}
          id={inputId}
          inputMode="numeric"
          min={0}
          onChange={handleLimitChange}
          placeholder={rule.unlimited ? "∞" : "0"}
          step={1}
          type="number"
          value={rule.limit}
        />
        <div className="flex items-center gap-2 text-sm">
          <Switch
            aria-label={`${definition.label}: ilimitado`}
            checked={rule.unlimited}
            onCheckedChange={handleUnlimitedChange}
          />
          Ilimitado
        </div>
      </div>
      <FieldError message={error} />
    </div>
  );
}

interface FeatureRuleProps {
  definition: EntitlementDefinition;
  onChange: (key: string, rule: RuleState) => void;
  rule: RuleState;
}

function FeatureRule({ definition, onChange, rule }: FeatureRuleProps) {
  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      onChange(definition.key, { ...rule, enabled: checked });
    },
    [definition.key, onChange, rule]
  );

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-sm">{definition.label}</span>
        <span className="text-muted-foreground text-xs">
          {definition.description}
        </span>
      </div>
      <Switch
        aria-label={definition.label}
        checked={rule.enabled}
        onCheckedChange={handleCheckedChange}
      />
    </div>
  );
}

export function PlanForm({ onSubmit, plan, submitLabel }: PlanFormProps) {
  const { catalog, error: catalogError, isLoading } = usePlanCatalog();
  const [overrides, setOverrides] = useState<Record<string, RuleState>>({});
  const [ruleErrors, setRuleErrors] = useState<Record<string, string>>({});
  const isDefaultPlan = plan?.isDefault === true;

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
  } = useForm<PlanSchema>({
    defaultValues: buildDefaultValues(plan),
    resolver: zodResolver(planSchema),
  });

  // Plano marcado como padrão (já salvo ou ligado agora) sempre fica visível: o backend recusa padrão oculto.
  const isDefaultValue = useWatch({ control, name: "isDefault" });
  const isPublicLocked = isDefaultPlan || isDefaultValue;

  useEffect(() => {
    if (isDefaultValue) {
      setValue("isPublic", true);
    }
  }, [isDefaultValue, setValue]);

  const groups = useMemo(() => groupCatalog(catalog), [catalog]);

  const getRule = useCallback(
    (key: string): RuleState => overrides[key] ?? buildInitialRule(plan, key),
    [overrides, plan]
  );

  const handleRuleChange = useCallback((key: string, rule: RuleState) => {
    setOverrides((current) => ({ ...current, [key]: rule }));
    setRuleErrors((current) => ({ ...current, [key]: "" }));
  }, []);

  const submit = handleSubmit(async (data) => {
    const nextErrors: Record<string, string> = {};
    const entitlements: SavePlanPayload["entitlements"] = [];

    for (const definition of catalog) {
      const rule = getRule(definition.key);

      if (definition.type === "feature") {
        entitlements.push({
          boolValue: rule.enabled,
          intValue: null,
          key: definition.key,
        });
        continue;
      }

      const limit = rule.unlimited ? null : parseLimit(rule.limit);
      if (!rule.unlimited && limit === null) {
        nextErrors[definition.key] =
          "Informe um número inteiro maior ou igual a 0, ou marque Ilimitado.";
      }
      entitlements.push({
        boolValue: null,
        intValue: limit,
        key: definition.key,
      });
    }

    setRuleErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      description: data.description.trim() || null,
      entitlements,
      isActive: data.isActive,
      isDefault: data.isDefault,
      isPublic: isDefaultPlan || data.isDefault || data.isPublic,
      monthlyPrice: data.monthlyPrice,
      name: data.name.trim(),
      sortOrder: data.sortOrder,
    });
  });

  return (
    <form className="flex flex-1 flex-col gap-5" onSubmit={submit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" {...register("name")} />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Input id="description" {...register("description")} />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="monthlyPrice">Preço mensal</Label>
          <NumberField
            control={control}
            decimals={2}
            fixed
            id="monthlyPrice"
            name="monthlyPrice"
            prefix="R$"
          />
          <FieldError message={errors.monthlyPrice?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sortOrder">Ordem</Label>
          <NumberField control={control} id="sortOrder" name="sortOrder" />
          <FieldError message={errors.sortOrder?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="isActive">Ativo</Label>
          <SwitchField
            control={control}
            disabled={isDefaultPlan}
            id="isActive"
            name="isActive"
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="isDefault">Plano padrão para novos usuários</Label>
          <SwitchField
            control={control}
            disabled={isDefaultPlan}
            id="isDefault"
            name="isDefault"
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="isPublic">Visível na página de planos</Label>
          <SwitchField
            control={control}
            disabled={isPublicLocked}
            id="isPublic"
            name="isPublic"
          />
        </div>
        {isDefaultPlan ? (
          <p className="text-muted-foreground text-xs">{DEFAULT_PLAN_HINT}</p>
        ) : null}
        {isPublicLocked ? (
          <p className="text-muted-foreground text-xs">
            {DEFAULT_PLAN_PUBLIC_HINT}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-semibold text-base">Regras</h3>
        {isLoading ? <Skeleton className="h-40 w-full" /> : null}
        {catalogError ? (
          <p className="text-destructive text-sm">{catalogError}</p>
        ) : null}
        {groups.map(([group, definitions]) => (
          <div className="flex flex-col gap-4" key={group}>
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              {group}
            </span>
            {definitions.map((definition) =>
              definition.type === "limit" ? (
                <LimitRule
                  definition={definition}
                  error={ruleErrors[definition.key]}
                  key={definition.key}
                  onChange={handleRuleChange}
                  rule={getRule(definition.key)}
                />
              ) : (
                <FeatureRule
                  definition={definition}
                  key={definition.key}
                  onChange={handleRuleChange}
                  rule={getRule(definition.key)}
                />
              )
            )}
          </div>
        ))}
      </div>

      <SideSheetActions>
        <SheetClose render={<Button type="button" variant="outline" />}>
          Cancelar
        </SheetClose>
        <Button
          disabled={isSubmitting || isLoading || Boolean(catalogError)}
          type="submit"
        >
          {submitLabel}
        </Button>
      </SideSheetActions>
    </form>
  );
}
