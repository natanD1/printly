import type { EntitlementDefinition, PlanEntitlement } from "@/types/plan";

/** Regra ligada (recurso) ou com algum limite diferente de 0; ausente = ilimitado. */
export function isEntitlementIncluded(
  definition: EntitlementDefinition,
  entitlement: PlanEntitlement | undefined
): boolean {
  if (definition.type === "feature") {
    return entitlement?.boolValue === true;
  }

  return entitlement?.intValue !== 0;
}

/** Texto da regra num plano, só a partir das unidades do catálogo. */
export function formatEntitlementValue(
  definition: EntitlementDefinition,
  entitlement: PlanEntitlement | undefined
): string {
  if (definition.type === "feature") {
    return entitlement?.boolValue === true ? "Incluído" : "Não incluído";
  }

  const limit = entitlement?.intValue ?? null;

  if (limit === null) {
    return "Ilimitado";
  }

  if (limit === 0) {
    return definition.zeroLabel ?? "Não incluído";
  }

  const unit = limit === 1 ? definition.unitSingular : definition.unit;

  return unit ? `${limit} ${unit}` : String(limit);
}
