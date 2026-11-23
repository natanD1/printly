import { z } from "zod";

/** Campos escalares do formulário de plano. As regras (catálogo) são tratadas à parte no `PlanForm`. */
export const planSchema = z.object({
  description: z.string().max(300, "Máximo de 300 caracteres"),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  isPublic: z.boolean(),
  monthlyPrice: z
    .number()
    .min(0, "O preço não pode ser negativo")
    .max(99_999_999.99, "O preço deve ser no máximo 99.999.999,99"),
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(80, "Máximo de 80 caracteres"),
  sortOrder: z.number().int().min(0, "A ordem não pode ser negativa"),
});

export type PlanSchema = z.infer<typeof planSchema>;
