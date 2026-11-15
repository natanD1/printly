import { z } from "zod";

export const productFilamentEntrySchema = z.object({
  filamentId: z.string().min(1, "Selecione um filamento"),
  gramsUsed: z.number().min(0, "Gramas não pode ser negativo"),
});

export const productSchema = z.object({
  filaments: z.array(productFilamentEntrySchema),
  photo: z.instanceof(File).nullable(),
  piecesPerPrint: z
    .number()
    .int("Peças por impressão deve ser inteiro")
    .min(1, "Mínimo 1"),
  productName: z.string().min(1, "Nome é obrigatório"),
  quantity: z.number().int("Quantidade deve ser inteira").min(1, "Mínimo 1"),
  salePriceOverride: z
    .number()
    .min(0, "Preço não pode ser negativo")
    .nullable(),
  totalHours: z.number().min(0, "Horas não pode ser negativo"),
});

export type ProductFilamentEntrySchema = z.infer<
  typeof productFilamentEntrySchema
>;
export type ProductSchema = z.infer<typeof productSchema>;
