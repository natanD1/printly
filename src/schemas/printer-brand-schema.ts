import { z } from "zod";

export const printerBrandSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export type PrinterBrandSchema = z.infer<typeof printerBrandSchema>;
