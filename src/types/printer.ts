/** Impressora do usuário: modelo do catálogo + parâmetros de custo próprios. */
export interface Printer {
  averagePowerWatts: number;
  brandId: string;
  brandName: string;
  createdAt: string;
  defaultProfitMarginPercentage: number;
  depreciationEnabled: boolean;
  /** Apelido, se houver; senão "Marca Modelo" (montado no backend). */
  displayName: string;
  failureEnabled: boolean;
  failureRatePercentage: number;
  id: string;
  maintenanceEnabled: boolean;
  maintenancePercentage: number;
  /** Base64 sem prefixo `data:`. */
  modelImage: string | null;
  modelName: string;
  nickname: string | null;
  printerLifespanHours: number;
  printerModelId: string;
  printerValue: number;
  updatedAt: string | null;
}
