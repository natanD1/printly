export interface PrinterModel {
  brandId: string;
  brandName: string;
  createdAt: string;
  id: string;
  /** Base64 sem prefixo `data:`. */
  image: string | null;
  isActive: boolean;
  name: string;
  updatedAt: string | null;
}
