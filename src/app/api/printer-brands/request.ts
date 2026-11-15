import { api } from "@/lib/api";
import type { PrinterBrandSchema } from "@/schemas/printer-brand-schema";
import type { PrinterBrand } from "@/types/printer-brand";

export async function getPrinterBrandsRequest(): Promise<PrinterBrand[]> {
  const response = await api.get<PrinterBrand[]>("/printer-brands");

  return response.data;
}

export async function createPrinterBrandRequest(
  data: PrinterBrandSchema
): Promise<PrinterBrand> {
  const response = await api.post<PrinterBrand>("/printer-brands", data);

  return response.data;
}
