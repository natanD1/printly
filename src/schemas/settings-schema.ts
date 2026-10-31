import { z } from "zod";

export const settingsSchema = z
  .object({
    averagePowerWatts: z.number().min(0, "Potência não pode ser negativa"),
    defaultProfitMarginPercentage: z
      .number()
      .min(0, "Margem não pode ser negativa"),
    depreciationEnabled: z.boolean(),
    failureEnabled: z.boolean(),
    failureRatePercentage: z
      .number()
      .min(0, "Taxa não pode ser negativa")
      .max(100, "Taxa não pode passar de 100%"),
    kwhPrice: z.number().min(0, "Preço do kWh não pode ser negativo"),
    maintenanceEnabled: z.boolean(),
    maintenancePercentage: z
      .number()
      .min(0, "Percentual não pode ser negativo"),
    printerLifespanHours: z.number().min(0, "Vida útil não pode ser negativa"),
    printerValue: z.number().min(0, "Valor não pode ser negativo"),
  })
  .refine(
    (data) => !data.depreciationEnabled || data.printerLifespanHours > 0,
    {
      message: "Informe a vida útil pra calcular a depreciação",
      path: ["printerLifespanHours"],
    }
  );

export type SettingsSchema = z.infer<typeof settingsSchema>;
