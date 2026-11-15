import { api } from "@/lib/api";
import type { PrinterSchema } from "@/schemas/printer-schema";
import type { Printer } from "@/types/printer";

export async function getPrintersRequest(): Promise<Printer[]> {
  const response = await api.get<Printer[]>("/printers");

  return response.data;
}

export async function createPrinterRequest(
  data: PrinterSchema
): Promise<Printer> {
  const response = await api.post<Printer>("/printers", data);

  return response.data;
}
