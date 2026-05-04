import type { Vehicle, VehicleOption } from "@/domain/vehicles";
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

  listOpciones(): Promise<VehicleOption[]> {
    return apiGet<VehicleOption[]>(endpoints.vehiclesOpciones);
  },

  create(body: VehicleWriteBody): Promise<Vehicle> {
    return apiPost<Vehicle, VehicleWriteBody>(endpoints.vehicles, body);
  },

  update(id: string, body: VehicleWriteBody): Promise<Vehicle> {
    return apiPut<Vehicle, VehicleWriteBody>(`${endpoints.vehicles}/${id}`, body);
  },
};
