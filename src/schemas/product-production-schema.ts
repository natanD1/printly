import { z } from "zod";

export const productProductionSchema = z.object({
  isProduced: z.boolean(),
});

export type ProductProductionSchema = z.infer<typeof productProductionSchema>;
