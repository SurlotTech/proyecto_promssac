export type VehicleStatus = "active" | "in_route" | "maintenance" | "inactive";
export type VehicleType = "Furgón" | "Camión" | "Moto" | "Camioneta";

export interface Vehicle {
  id: string;
  plate: string;
  type: VehicleType;
  group: string;
  driver: string | null;
  status: VehicleStatus;
  capacityKg: number;
  loadPct: number;
  lastService: string;
  createdAt: string;
  autoManaged: boolean;
}

export const statusMeta: Record<VehicleStatus, { label: string; className: string; dot: string }> = {
  active: {
    label: "Activo",
    className: "bg-success-soft text-success",
    dot: "bg-success",
  },
  in_route: {
    label: "En ruta",
    className: "bg-info-soft text-info",
    dot: "bg-info",
  },
  maintenance: {
    label: "Mantenimiento",
    className: "bg-warning-soft text-warning",
    dot: "bg-warning",
  },
  inactive: {
    label: "Inactivo",
    className: "bg-muted text-muted-foreground",
    dot: "bg-tertiary",
  },
};
