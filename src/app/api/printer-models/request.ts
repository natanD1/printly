import { api } from "@/lib/api";
import type { PrinterModelSchema } from "@/schemas/printer-model-schema";
import type { PrinterModel } from "@/types/printer-model";

export function buildPrinterModelFormData(
  data: PrinterModelSchema,
  isActive?: boolean
): FormData {
  const formData = new FormData();

  formData.append("Name", data.name);
  formData.append("BrandId", data.brandId);

  if (data.image) {
    formData.append("Image", data.image);
  }

  if (isActive !== undefined) {
    formData.append("IsActive", String(isActive));
  }

  return formData;
}

export async function getPrinterModelsRequest(): Promise<PrinterModel[]> {
  const response = await api.get<PrinterModel[]>("/printer-models");

  return response.data;
}

export async function createPrinterModelRequest(
  data: PrinterModelSchema
): Promise<PrinterModel> {
  const response = await api.post<PrinterModel>(
    "/printer-models",
    buildPrinterModelFormData(data)
  );

  return response.data;
}
