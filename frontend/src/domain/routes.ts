export type RouteStatus =
  | "scheduled"
  | "delayed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type RoutePriority = "high" | "medium" | "low";

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
  endDate?: string;
  createdAt: string;
  priority: RoutePriority;
  currentCollection: number;
  totalCollection: number;
  amountInRoute: number;
  status: RouteStatus;
  place: string;
}

export const routeStatusMeta: Record<
  RouteStatus,
  { label: string; className: string; dot: string }
> = {
  scheduled: {
    label: "Pendiente",
    className: "bg-[#fff0d2] text-[#c97900]",
    dot: "bg-[#c97900]",
  },
  delayed: {
    label: "Retrasada",
    className: "bg-[#ffe1dc] text-[#d92316]",
    dot: "bg-[#d92316]",
  },
  in_progress: {
    label: "Activa",
    className: "bg-[#d8f7e5] text-[#009f5b]",
    dot: "bg-[#009f5b]",
  },
  completed: {
    label: "Completada",
    className: "bg-[#d1f2eb] text-[#0e7c6b]",
    dot: "bg-[#0e7c6b]",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-[#e9eef2] text-[#5f7282]",
    dot: "bg-[#5f7282]",
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
