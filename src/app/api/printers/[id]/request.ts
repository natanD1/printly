import { api } from "@/lib/api";
import type { PrinterSchema } from "@/schemas/printer-schema";
import type { Printer } from "@/types/printer";

export async function updatePrinterRequest(
  id: string,
  data: PrinterSchema
): Promise<Printer> {
  const response = await api.put<Printer>(`/printers/${id}`, data);

  return response.data;
}

export async function deletePrinterRequest(id: string): Promise<void> {
  await api.delete(`/printers/${id}`);
}
