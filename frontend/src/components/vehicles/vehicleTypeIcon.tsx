import { Bike, Car, Package, Truck, type LucideIcon } from "lucide-react";
import type { VehicleType } from "@/data/vehicles";

export const vehicleTypeIcon: Record<VehicleType, LucideIcon> = {
  Furgón: Truck,
  Camión: Package,
  Moto: Bike,
  Camioneta: Car,
};
