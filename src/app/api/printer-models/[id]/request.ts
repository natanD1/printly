import { buildPrinterModelFormData } from "@/app/api/printer-models/request";
import { api } from "@/lib/api";
import type { PrinterModelSchema } from "@/schemas/printer-model-schema";
import type { PrinterModel } from "@/types/printer-model";

export async function updatePrinterModelRequest(
  id: string,
  data: PrinterModelSchema,
  isActive: boolean
): Promise<PrinterModel> {
  const response = await api.put<PrinterModel>(
    `/printer-models/${id}`,
    buildPrinterModelFormData(data, isActive)
  );

  return response.data;
}
