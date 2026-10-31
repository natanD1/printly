export interface ProductFilamentUsage {
  brand: string;
  colorHex: string;
  filamentId: string;
  gramsUsed: number;
  name: string;
}

export interface Product {
  costPrice: number;
  createdAt: string;
  filaments: ProductFilamentUsage[];
  id: string;
  productName: string;
  productPhoto: string | null;
  quantity: number;
  salePrice: number;
  suggestedSalePrice: number;
  totalFilament: number;
  totalHours: number;
  unitSalePrice: number;
  updatedAt: string | null;
}
