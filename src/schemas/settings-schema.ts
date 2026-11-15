import { z } from "zod";

export const settingsSchema = z.object({
  kwhPrice: z.number().min(0, "Preço do kWh não pode ser negativo"),
});

export type SettingsSchema = z.infer<typeof settingsSchema>;
