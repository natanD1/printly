export type PlanEntitlementKey =
  | "MaxPrinters"
  | "MaxFilaments"
  | "MaxProductsPerMonth"
  | "ProductHistoryMonths"
  | "CompanyLogoInQuote"
  | "RemoveBrandingFooter"
  | "OptionalCostsEnabled";

// Chaves vêm do catálogo do backend: código genérico usa `string`, a união serve para pontos que consomem uma regra específica.
export type EntitlementType = "limit" | "feature";

export interface EntitlementDefinition {
  description: string;
  group: string;
  key: string;
  label: string;
  type: EntitlementType;
  /** Unidade no plural (só limites; `null` para recursos). */
  unit: string | null;
  unitSingular: string | null;
  /** Texto exibido quando o limite é 0 (ex: "Só o mês atual"). */
  zeroLabel: string | null;
}

export interface PlanEntitlement {
  boolValue: boolean | null;
  intValue: number | null;
  key: string;
}

export interface Plan {
  description: string | null;
  entitlements: PlanEntitlement[];
  id: string;
  isActive: boolean;
  isDefault: boolean;
  isPublic: boolean;
  monthlyPrice: number;
  name: string;
  sortOrder: number;
  userCount: number;
}

export type SavePlanPayload = Omit<Plan, "id" | "userCount">;

export interface AvailablePlan {
  description: string | null;
  entitlements: PlanEntitlement[];
  id: string;
  isCurrent: boolean;
  monthlyPrice: number;
  name: string;
  sortOrder: number;
}

export interface AvailablePlans {
  plans: AvailablePlan[];
  rules: EntitlementDefinition[];
}

export interface MyPlanEntitlement {
  enabled: boolean | null;
  key: string;
  label: string;
  limit: number | null;
  type: EntitlementType;
  used: number | null;
}

export interface MyPlan {
  entitlements: MyPlanEntitlement[];
  isAdmin: boolean;
  planId: string;
  planName: string;
}

export interface ManagedUser {
  createdAt: string;
  email: string;
  id: string;
  isAdmin: boolean;
  name: string;
  planId: string;
  planName: string;
}

export const PLAN_ERROR_CODES = {
  featureUnavailable: "PLAN_FEATURE_UNAVAILABLE",
  limitReached: "PLAN_LIMIT_REACHED",
} as const;
