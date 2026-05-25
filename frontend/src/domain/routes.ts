export type RouteStatus =
  | "scheduled"
  | "delayed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type RoutePriority = "high" | "medium" | "low";

export interface RouteOrder {
  id: string;
  status: string;
  substatus: string;
  vehiclePlate: string;
  clientName: string;
  contactName: string;
  contactIdentifier: string;
  contactPhone: string;
  driverName: string;
  addressLine: string;
  routeDate?: string;
}

export interface Route {
  /** UUID de la ruta (API). */
  id: string;
  /** Código legible (ej. R1A2B3C). */
  code: string;
  name: string;
  vehicleId: string;
  vehiclePlate: string;
  mobileUser: string;
  dispatchCompleted: number;
  dispatchTotal: number;
  deliveryDate: string;
  createdAt: string;
  priority: RoutePriority;
  currentCollection: number;
  totalCollection: number;
  amountInRoute: number;
  status: RouteStatus;
  place: string;
  orders?: RouteOrder[];
}

export const routeStatusMeta: Record<
  RouteStatus,
  { label: string; className: string; dot: string }
> = {
  scheduled: {
    label: "Programada",
    className: "bg-info-soft text-info",
    dot: "bg-info",
  },
  delayed: {
    label: "Retrasada",
    className: "bg-warning-soft text-warning",
    dot: "bg-warning",
  },
  in_progress: {
    label: "En curso",
    className: "bg-primary-soft text-primary",
    dot: "bg-primary",
  },
  completed: {
    label: "Completada",
    className: "bg-success-soft text-success",
    dot: "bg-success",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export const routePriorityMeta: Record<RoutePriority, { label: string; className: string }> = {
  high: {
    label: "Prioridad Alta",
    className: "bg-primary-soft text-primary",
  },
  medium: {
    label: "Prioridad Media",
    className: "bg-info-soft text-info",
  },
  low: {
    label: "Prioridad Baja",
    className: "bg-muted text-muted-foreground",
  },
};

export const places = ["Lima Centro", "Lima Norte", "Lima Sur", "Lima Este", "Lima Oeste"];

/** Fecha UI dd/MM/yyyy → yyyy-MM-dd para inputs type="date". */
export function routeDeliveryUiToIso(ddMmYyyy: string): string {
  const parts = ddMmYyyy.trim().split("/");
  if (parts.length !== 3) return "";
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}
