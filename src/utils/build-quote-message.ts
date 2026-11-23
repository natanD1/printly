import { formatCurrency } from "@/utils/format-currency";

interface QuoteMessageInput {
  customerName?: string | null;
  productName: string;
  quantity: number;
  /** Valor total do lote (`salePrice`); nunca custo nem preço sugerido. */
  total: number;
}

export function buildQuoteMessage({
  customerName,
  productName,
  quantity,
  total,
}: QuoteMessageInput): string {
  const name = customerName?.trim();
  const greeting = name ? `Olá, ${name}!` : "Olá!";

  return `${greeting} Segue o orçamento de ${productName} (${quantity} un.), no valor total de ${formatCurrency(total)}. Validade: 7 dias.`;
}
