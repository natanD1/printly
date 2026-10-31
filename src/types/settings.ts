export interface Settings {
  averagePowerWatts: number;
  createdAt: string;
  defaultProfitMarginPercentage: number;
  depreciationEnabled: boolean;
  failureEnabled: boolean;
  failureRatePercentage: number;
  id: string;
  kwhPrice: number;
  maintenanceEnabled: boolean;
  maintenancePercentage: number;
  printerLifespanHours: number;
  printerValue: number;
  updatedAt: string | null;
}
