import { api } from "@/lib/api";
import type { PrinterBrandSchema } from "@/schemas/printer-brand-schema";
import type { PrinterBrand } from "@/types/printer-brand";

export async function updatePrinterBrandRequest(
  id: string,
  data: PrinterBrandSchema,
  isActive: boolean
): Promise<PrinterBrand> {
  const response = await api.put<PrinterBrand>(`/printer-brands/${id}`, {
    ...data,
    isActive,
  });

  return response.data;
}
