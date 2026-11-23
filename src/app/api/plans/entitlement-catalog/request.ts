import { api } from "@/lib/api";
import type { EntitlementDefinition } from "@/types/plan";

export async function getEntitlementCatalogRequest(): Promise<
  EntitlementDefinition[]
> {
  const response = await api.get<EntitlementDefinition[]>(
    "/plans/entitlement-catalog"
  );

  return response.data;
}
