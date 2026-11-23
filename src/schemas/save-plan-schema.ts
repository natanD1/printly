import { z } from "zod";

const planEntitlementSchema = z.object({
  boolValue: z.boolean().nullable(),
  intValue: z.number().int().min(0).nullable(),
  key: z.string().min(1),
});

export const savePlanSchema = z.object({
  description: z.string().max(300).nullable(),
  entitlements: z.array(planEntitlementSchema),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  isPublic: z.boolean().default(true),
  monthlyPrice: z.number().min(0).max(99_999_999.99),
  name: z.string().min(1, "Nome é obrigatório").max(80),
  sortOrder: z.number().int(),
});

export type SavePlanSchema = z.infer<typeof savePlanSchema>;
