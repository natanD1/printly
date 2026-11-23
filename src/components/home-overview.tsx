"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BillingIndicator } from "@/components/billing-indicator";
import { ModalCommunication } from "@/components/modal-communication";
import { ProductsTable } from "@/components/products-table";
import { TotalHourPrintIndicator } from "@/components/total-hour-print-indicator";
import { TotalProductsCount } from "@/components/total-products-count";
import { useMyPlan } from "@/hooks/use-my-plan";
import { useProducts } from "@/hooks/use-products";
import { PLAN_ERROR_CODES } from "@/types/plan";
import {
  currentMonthRange,
  formatRangeLabel,
  homeMinDate,
  isSameRange,
} from "@/utils/date-filters";

export function HomeOverview() {
  const [range, setRange] = useState(currentMonthRange);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const { isLoading: isPlanLoading, myPlan } = useMyPlan();
  const {
    createProduct,
    deleteProduct,
    error,
    errorCode,
    fetchProducts,
    isLoading,
    products,
    setProductProduced,
    updateProduct,
  } = useProducts(range);

  // Meses anteriores consultáveis: admin e plano ilimitado = sem mínimo (null).
  // Enquanto o plano carrega, só o mês atual (o período padrão já é ele);
  // em erro ao carregar, não restringe aqui (o backend é a trava de verdade).
  let monthsBack: number | null = null;
  if (isPlanLoading) {
    monthsBack = 0;
  } else if (myPlan && !myPlan.isAdmin) {
    monthsBack =
      myPlan.entitlements.find((item) => item.key === "ProductHistoryMonths")
        ?.limit ?? null;
  }

  // Plano rebaixado (ou período antigo): range antes do novo mínimo volta ao mês atual.
  const minTime = homeMinDate(monthsBack)?.getTime() ?? null;
  useEffect(() => {
    if (minTime !== null && range.from.getTime() < minTime) {
      setRange(currentMonthRange());
    }
  }, [minTime, range]);

  // 403 de limite de histórico: avisa com a mensagem do backend e volta ao mês atual.
  useEffect(() => {
    if (errorCode === PLAN_ERROR_CODES.limitReached) {
      setLimitMessage(error);
      setRange(currentMonthRange());
    }
  }, [error, errorCode]);

  // A API já devolve só os produtos do período; aqui é só somar.
  // Orçamentos ficam de fora: só produto produzido conta nos indicadores.
  const { billing, hours, productsCount } = useMemo(() => {
    const produced = products.filter((product) => product.isProduced);

    return {
      billing: produced.reduce(
        (total, product) => total + product.salePrice,
        0
      ),
      hours: produced.reduce((total, product) => total + product.batchHours, 0),
      productsCount: produced.reduce(
        (total, product) => total + product.quantity,
        0
      ),
    };
  }, [products]);

  const handleLimitOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setLimitMessage(null);
    }
  }, []);

  const periodDescription = isSameRange(range, currentMonthRange())
    ? "Referente ao mês atual"
    : `Período: ${formatRangeLabel(range)}`;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BillingIndicator description={periodDescription} value={billing} />
        <TotalHourPrintIndicator
          description={periodDescription}
          hours={hours}
        />
        <TotalProductsCount
          count={productsCount}
          description={periodDescription}
        />
      </div>

      <ProductsTable
        createProduct={createProduct}
        deleteProduct={deleteProduct}
        error={error}
        isLoading={isLoading}
        monthsBack={monthsBack}
        onRangeChange={setRange}
        onRefresh={fetchProducts}
        products={products}
        range={range}
        setProductProduced={setProductProduced}
        updateProduct={updateProduct}
      />

      <ModalCommunication
        description={limitMessage ?? undefined}
        onOpenChange={handleLimitOpenChange}
        open={limitMessage !== null}
        title="Período fora do seu plano"
        variant="warning"
      />
    </div>
  );
}
