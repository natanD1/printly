"use client";

import { useMemo, useState } from "react";
import { BillingIndicator } from "@/components/billing-indicator";
import { ProductsTable } from "@/components/products-table";
import { TotalHourPrintIndicator } from "@/components/total-hour-print-indicator";
import { TotalProductsCount } from "@/components/total-products-count";
import { useProducts } from "@/hooks/use-products";
import {
  currentMonthRange,
  formatRangeLabel,
  isSameRange,
} from "@/utils/date-filters";

export function HomeOverview() {
  const [range, setRange] = useState(currentMonthRange);
  const {
    createProduct,
    deleteProduct,
    error,
    fetchProducts,
    isLoading,
    products,
    updateProduct,
  } = useProducts(range);

  // A API já devolve só os produtos do período; aqui é só somar.
  const { billing, hours, productsCount } = useMemo(
    () => ({
      billing: products.reduce(
        (total, product) => total + product.salePrice,
        0
      ),
      hours: products.reduce((total, product) => total + product.batchHours, 0),
      productsCount: products.reduce(
        (total, product) => total + product.quantity,
        0
      ),
    }),
    [products]
  );

  const periodDescription = isSameRange(range, currentMonthRange())
    ? "Referente ao mês atual"
    : `Período: ${formatRangeLabel(range)}`;

  return (
    <div className="flex flex-col gap-4">
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
        onRangeChange={setRange}
        onRefresh={fetchProducts}
        products={products}
        range={range}
        updateProduct={updateProduct}
      />
    </div>
  );
}
