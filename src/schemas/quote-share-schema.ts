import { z } from "zod";
import { normalizePhone } from "@/utils/normalize-phone";

export const quoteShareSchema = z.object({
  customerName: z.string().trim().optional(),
  customerPhone: z
    .string()
    .optional()
    .refine((value) => normalizePhone(value ?? "").ok, {
      message: "Telefone inválido. Use DDD + número.",
    }),
});

export type QuoteShareSchema = z.infer<typeof quoteShareSchema>;
