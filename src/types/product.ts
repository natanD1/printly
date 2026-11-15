export interface ProductFilamentUsage {
  brand: string;
  colorHex: string;
  filamentId: string;
  gramsUsed: number;
  name: string;
}

export interface Product {
  /** Filamento do lote inteiro (gramas por impressão × impressões), calculado no backend. */
  batchFilament: number;
  /** Horas do lote inteiro (horas por impressão × impressões), calculado no backend. */
  batchHours: number;
  costPrice: number;
  createdAt: string;
  filaments: ProductFilamentUsage[];
  id: string;
  piecesPerPrint: number;
  productName: string;
  productPhoto: string | null;
  quantity: number;
  salePrice: number;
  suggestedSalePrice: number;
  /** Gramas de uma impressão (soma dos filamentos). */
  totalFilament: number;
  /** Horas de uma impressão, como o fatiador mostra. */
  totalHours: number;
  unitSalePrice: number;
  updatedAt: string | null;
}
