import type { Product } from "@/types/product";
import type { QuoteData } from "@/types/quote";

/** Único ponto que converte `Product` em dados de orçamento: copia só os campos permitidos. */
export function toQuoteData(product: Product): QuoteData {
  return {
    productName: product.productName,
    productPhoto: product.productPhoto,
    quantity: product.quantity,
    salePrice: product.salePrice,
    unitSalePrice: product.unitSalePrice,
  };
}
