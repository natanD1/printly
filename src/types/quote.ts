/**
 * Dados do orçamento enviados ao cliente. Estreito de propósito: só o que pode
 * aparecer no PDF/mensagem. Nunca incluir custo, preço sugerido, margem,
 * impressora ou filamentos.
 */
export interface QuoteData {
  productName: string;
  /** Base64 puro (sem prefixo `data:`), como vem da API. */
  productPhoto: string | null;
  quantity: number;
  /** Total do lote (`salePrice` do produto). */
  salePrice: number;
  /** Valor por unidade (`unitSalePrice` do produto). */
  unitSalePrice: number;
}

export interface QuoteCompany {
  email: string | null;
  instagram: string | null;
  logoBase64: string | null;
  name: string;
  phone: string | null;
  website: string | null;
  whatsApp: string | null;
}
