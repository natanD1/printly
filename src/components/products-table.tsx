"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { buildProductsColumns } from "@/components/products-columns";
import { ProductsToolbar } from "@/components/products-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductSchema } from "@/schemas/product-schema";
import type { Product } from "@/types/product";
import type { DateRange } from "@/utils/date-filters";

interface ProductsTableProps {
  createProduct: (data: ProductSchema) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  error: string | null;
  isLoading: boolean;
  monthsBack: number | null;
  onRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
  products: Product[];
  range: DateRange;
  setProductProduced: (id: string, isProduced: boolean) => Promise<void>;
  updateProduct: (id: string, data: ProductSchema) => Promise<void>;
}

export function ProductsTable({
  createProduct,
  deleteProduct,
  error,
  isLoading,
  monthsBack,
  onRangeChange,
  onRefresh,
  products,
  range,
  setProductProduced,
  updateProduct,
}: ProductsTableProps) {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return products;
    }

    return products.filter((product) =>
      product.productName.toLowerCase().includes(term)
    );
  }, [products, search]);

  const columns = useMemo(
    () =>
      buildProductsColumns(deleteProduct, updateProduct, setProductProduced),
    [deleteProduct, updateProduct, setProductProduced]
  );

  return (
    <div className="flex flex-col gap-4">
      <ProductsToolbar
        monthsBack={monthsBack}
        onCreate={createProduct}
        onRangeChange={onRangeChange}
        onRefresh={onRefresh}
        onSearchChange={setSearch}
        range={range}
        search={search}
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <DataTable columns={columns} data={filteredProducts} pageSize={10} />
      )}
    </div>
  );
}
