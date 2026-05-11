/** Opción de ruta para combos al crear o editar una orden. */
export type OrderRouteOption = { id: string; label: string };

export type OrderStatus =
  | "pending"
  | "in_route"
  | "delivered"
  | "no_delivered"
  | "partially_delivered"

export interface Order {
  id: string;
  status: OrderStatus;
  substatus: string;
  vehiclePlate: string;
  clientName: string;
  /** UUID del cliente de catálogo si la orden tiene `cliente_id`. */
  clientId?: string;
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

  /** Conductor operativo (usuario móvil de la ruta o nombre en vehículo). */
  driverName?: string;

  /** Teléfono del usuario móvil del vehículo de la ruta/orden (si existe en BD). */
  driverPhone?: string;

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
  in_route: {
    label: "En ruta",
    className: "bg-info-soft text-info",
    dot: "bg-info",
  },
  delivered: {
    label: "Entregado",
    className: "bg-success-soft text-success",
    dot: "bg-success",
  },
  no_delivered: {
    label: "No Entregado",
    className: "bg-info-soft text-info",
    dot: "bg-info",
  },
  partially_delivered: {
    label: "Entrega Parcial",
    className: "bg-primary-soft text-primary",
    dot: "bg-primary",
  },
};
