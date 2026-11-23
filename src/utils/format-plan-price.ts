import { formatCurrency } from "@/utils/format-currency";

/** Preço mensal do plano para exibição: 0 vira "Grátis", senão moeda + "/mês". */
export function formatPlanPrice(monthlyPrice: number): {
  amount: string;
  period: string | null;
} {
  if (monthlyPrice === 0) {
    return { amount: "Grátis", period: null };
  }

  return { amount: formatCurrency(monthlyPrice), period: "/mês" };
}
