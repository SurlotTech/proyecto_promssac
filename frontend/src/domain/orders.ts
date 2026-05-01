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
