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
  /**
   * `false` = orçamento: só calcula preço, não desconta estoque nem entra nos indicadores.
   * `true` = produzido: filamento descontado e contabilizado. Produto novo nasce `false`.
   */
  isProduced: boolean;
  piecesPerPrint: number;
  /** Nulo só em produtos anteriores ao módulo de impressoras (editar exige escolher uma). */
  printerId: string | null;
  /** Apelido ou "Marca Modelo" da impressora usada no cálculo. */
  printerName: string | null;
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
