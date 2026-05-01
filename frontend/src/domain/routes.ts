export type RouteStatus =
  | "scheduled"
  | "delayed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type RoutePriority = "high" | "medium" | "low";

export interface Route {
  id: string;
  name: string;
  vehicleId: string;
  vehiclePlate: string;
  mobileUser: string;
  dispatchCompleted: number;
  dispatchTotal: number;
  deliveryDate: string;
  startTime: string;
  endTime: string;
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
