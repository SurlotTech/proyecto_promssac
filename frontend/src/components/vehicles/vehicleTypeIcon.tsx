import { Package, Truck, type LucideIcon } from "lucide-react";
import type { VehicleType } from "@/domain/vehicles";

export const vehicleTypeIcon: Record<VehicleType, LucideIcon> = {
  Furgón: Truck,
  Camión: Package,
};
