import { z } from "zod";

export const printerSchema = z
  .object({
    averagePowerWatts: z.number().min(0, "Potência não pode ser negativa"),
    /** Só pra filtrar os modelos no formulário; o backend usa `printerModelId`. */
    brandId: z.string().min(1, "Selecione a marca"),
    defaultProfitMarginPercentage: z
      .number()
      .min(0, "Margem não pode ser negativa"),
    depreciationEnabled: z.boolean(),
    failureEnabled: z.boolean(),
    failureRatePercentage: z
      .number()
      .min(0, "Taxa não pode ser negativa")
      .max(100, "Taxa não pode passar de 100%"),
    maintenanceEnabled: z.boolean(),
    maintenancePercentage: z
      .number()
      .min(0, "Percentual não pode ser negativo"),
    nickname: z.string().max(100, "Máximo de 100 caracteres"),
    printerLifespanHours: z.number().min(0, "Vida útil não pode ser negativa"),
    printerModelId: z.string().min(1, "Selecione o modelo"),
    printerValue: z.number().min(0, "Valor não pode ser negativo"),
  })
  .refine(
    (data) => !data.depreciationEnabled || data.printerLifespanHours > 0,
    {
      message: "Informe a vida útil pra calcular a depreciação",
      path: ["printerLifespanHours"],
    }
  );

export type PrinterSchema = z.infer<typeof printerSchema>;
