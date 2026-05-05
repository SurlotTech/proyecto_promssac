/** Opción de ruta para combos al crear o editar una orden. */
export type OrderRouteOption = { id: string; label: string };

export type OrderStatus =
  | "pending"
  | "preparing"
  | "in_route"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  status: OrderStatus;
  substatus: string;
  vehiclePlate: string;
  clientName: string;
  routeDate: string;
  contactName: string;
  contactIdentifier: string;
  routeDateIso: string;
  createdAtIso: string;
  isLastDispatch: boolean;
  /** UUID de la ruta asignada en backend, si existe. */
  routeId?: string;

  /** UUID del vehículo asignado (lista/detalle backend). */
  vehicleId?: string;

  /** Presentes cuando la orden tiene datos del flujo Completar (GET detalle / lista enriquecida). */
  contactPhone?: string;
  contactEmail?: string;
  addressLine?: string;
  normalizedAddress?: string;
  latitude?: number;
  longitude?: number;
  serviceMinutes?: number;
  addressReference?: string;
  deliveryWindowFrom?: string;
  deliveryWindowTo?: string;
  deliveryMode?: string;
  deliveryPriority?: string;
  cashOnDelivery?: boolean;
  customFields?: Record<string, string>;
}

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: "Pendiente",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  preparing: {
    label: "En preparación",
    className: "bg-info-soft text-info",
    dot: "bg-info",
  },
  in_route: {
    label: "En ruta",
    className: "bg-primary-soft text-primary",
    dot: "bg-primary",
  },
  delivered: {
    label: "Entregado",
    className: "bg-success-soft text-success",
    dot: "bg-success",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-warning-soft text-warning",
    dot: "bg-warning",
  },
};
