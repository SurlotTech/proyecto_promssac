/** Opción de ruta para combos al crear o editar una orden. */
export type OrderRouteOption = { id: string; label: string };

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

export type OrderSubstatus =
  | "Recepcionado conforme"
  | "Entrega tercero"
  | "Entrega UGEL"
  | "Devolución"
  | "En ruta"
  | "Pendiente";

export const orderSubstatusMeta: Record<
  OrderSubstatus,
  { label: string; estado: OrderStatus }
> = {
  "Recepcionado conforme": { label: "Recepcionado conforme", estado: "entregado" },
  "Entrega tercero": { label: "Entrega tercero", estado: "entregado" },
  "Entrega UGEL": { label: "Entrega UGEL", estado: "entregado" },
  "Devolución": { label: "Devolución", estado: "no_entregado" },
  "En ruta": { label: "En ruta", estado: "in_route" },
  "Pendiente": { label: "Pendiente", estado: "pending" },
};