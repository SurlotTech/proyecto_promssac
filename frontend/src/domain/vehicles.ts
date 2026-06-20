export type VehicleStatus = "active" | "in_route" | "maintenance" | "inactive";
export type VehicleType = "Furgón" | "Camión";

/** Tipos admitidos en combos / alta usuario móvil (alineado con backend). */
export const VEHICLE_TYPE_OPTIONS: readonly VehicleType[] = ["Furgón", "Camión"];

export interface Vehicle {
  id: string;
  plate: string;
  type: VehicleType;
  group: string;
  /** Nombre del usuario móvil asignado al vehículo (si hay). */
  driver: string | null;
  /** Id del usuario móvil asignado (JSON: `driverId`) para reasignar o editar. */
  driverId?: string | null;
  status: VehicleStatus;
  capacityKg: number;
  loadPct: number;
  lastService: string;
  createdAt: string;
  autoManaged: boolean;
}

/** Respuesta ligera de GET /vehiculos/opciones (selectores). */
export type VehicleOption = Pick<Vehicle, "id" | "plate" | "type">;

export function vehicleOptionLabel(v: VehicleOption): string {
  return `${v.plate} -- ${v.type}`;
}

/** Combo rutas: placa y tipo de vehículo (sin id). */
export function vehicleRouteSelectLabel(v: Pick<Vehicle, "plate" | "type">): string {
  return `${v.plate} · ${v.type}`;
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
