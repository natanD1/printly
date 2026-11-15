import { z } from "zod";

export const printerModelSchema = z.object({
  brandId: z.string().min(1, "Selecione a marca"),
  image: z.instanceof(File).nullable().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
});

export type PrinterModelSchema = z.infer<typeof printerModelSchema>;
