/** Opción de ruta para combos al crear o editar una orden. */
export type OrderRouteOption = { id: string; label: string };

export interface AlertOrder {
  id: string;
  status: string;
  substatus: string;
  vehiclePlate: string;
  routeDate: string;
  createdAt: string;
}

export type OrderStatus =
  | "entregado"
  | "no_entregado"
  | "in_route"
  | "pending";

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; className: string; dot: string }
> = {
  entregado: {
    label: "Entregado",
    className: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  no_entregado: {
    label: "No entregado",
    className: "bg-red-500/10 text-red-700 border border-red-500/20",
    dot: "bg-red-500",
  },
  in_route: {
    label: "En ruta",
    className: "bg-blue-500/10 text-blue-700 border border-blue-500/20",
    dot: "bg-blue-500",
  },
  pending: {
    label: "Pendiente",
    className: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
    dot: "bg-amber-500",
  },
};
