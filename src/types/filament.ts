import type { FilamentBrand } from "@/types/filament-brand";
import type { FilamentType } from "@/types/filament-type";

export interface Filament {
  brand: FilamentBrand;
  colorHex: string;
  createdAt: string;
  filamentPrice: number;
  id: string;
  initialWeight: number;
  name: string;
  type: FilamentType;
  updatedAt: string | null;
  weight: number;
}
