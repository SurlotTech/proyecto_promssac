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
  /** Despachos completados vs programados en la ruta */
  dispatchCompleted: number;
  dispatchTotal: number;
  deliveryDate: string;
  startTime: string;
  /** Ventana horaria mostrada en tarjetas (ej. fin estimado de ruta) */
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

export const routePriorityMeta: Record<
  RoutePriority,
  { label: string; className: string }
> = {
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

export const routes: Route[] = [
  {
    id: "R001",
    name: "Ruta Centro - Mañana",
    vehicleId: "1",
    vehiclePlate: "BFS-748",
    mobileUser: "Carlos Mendoza",
    dispatchCompleted: 11,
    dispatchTotal: 18,
    deliveryDate: "28/04/2026",
    startTime: "08:00",
    endTime: "14:30",
    createdAt: "27/04/2026 14:30",
    priority: "high",
    currentCollection: 450.50,
    totalCollection: 1200.00,
    amountInRoute: 750.00,
    status: "in_progress",
    place: "Lima Centro",
  },
  {
    id: "R002",
    name: "Ruta Norte - Tarde",
    vehicleId: "2",
    vehiclePlate: "BHT-734",
    mobileUser: "Emerson Tineo",
    dispatchCompleted: 6,
    dispatchTotal: 14,
    deliveryDate: "28/04/2026",
    startTime: "14:00",
    endTime: "20:00",
    createdAt: "27/04/2026 16:45",
    priority: "medium",
    currentCollection: 230.00,
    totalCollection: 800.00,
    amountInRoute: 570.00,
    status: "scheduled",
    place: "Lima Norte",
  },
  {
    id: "R003",
    name: "Ruta Sur - Mañana",
    vehicleId: "3",
    vehiclePlate: "BKT-760",
    mobileUser: "Ana López",
    dispatchCompleted: 15,
    dispatchTotal: 15,
    deliveryDate: "27/04/2026",
    startTime: "07:30",
    endTime: "13:00",
    createdAt: "26/04/2026 10:00",
    priority: "low",
    currentCollection: 890.00,
    totalCollection: 890.00,
    amountInRoute: 0,
    status: "completed",
    place: "Lima Sur",
  },
  {
    id: "R004",
    name: "Ruta Centro - Noche",
    vehicleId: "4",
    vehiclePlate: "CAG-900",
    mobileUser: "Pedro Ramos",
    dispatchCompleted: 0,
    dispatchTotal: 10,
    deliveryDate: "28/04/2026",
    startTime: "18:00",
    endTime: "23:00",
    createdAt: "27/04/2026 09:15",
    priority: "high",
    currentCollection: 0,
    totalCollection: 600.00,
    amountInRoute: 600.00,
    status: "delayed",
    place: "Lima Centro",
  },
  {
    id: "R005",
    name: "Ruta Este - Mañana",
    vehicleId: "5",
    vehiclePlate: "DVR-221",
    mobileUser: "María García",
    dispatchCompleted: 10,
    dispatchTotal: 10,
    deliveryDate: "26/04/2026",
    startTime: "08:30",
    endTime: "12:00",
    createdAt: "25/04/2026 11:20",
    priority: "medium",
    currentCollection: 520.00,
    totalCollection: 520.00,
    amountInRoute: 0,
    status: "cancelled",
    place: "Lima Este",
  },
];

export const vehicles = [
  { id: "1", plate: "BFS-748" },
  { id: "2", plate: "BHT-734" },
  { id: "3", plate: "BKT-760" },
  { id: "4", plate: "CAG-900" },
  { id: "5", plate: "DVR-221" },
];

export const places = ["Lima Centro", "Lima Norte", "Lima Sur", "Lima Este", "Lima Oeste"];

export const drivers = ["Carlos Mendoza", "Emerson Tineo", "Ana López", "Pedro Ramos", "María García"];