import type { Vehicle } from "@/domain/vehicles";
import { apiGet, apiPost } from "@/lib/api";
import { endpoints } from "./endpoints";

export interface VehicleWriteBody {
  plate: string;
  type: string;
  group: string;
  driver: string | null;
  status: string;
  capacityKg: number;
  loadPct: number;
  lastService?: string;
  autoManaged: boolean;
}

export const vehiclesApi = {
  list(): Promise<Vehicle[]> {
    return apiGet<Vehicle[]>(endpoints.vehicles);
  },

  create(body: VehicleWriteBody): Promise<Vehicle> {
    return apiPost<Vehicle, VehicleWriteBody>(endpoints.vehicles, body);
  },
};
