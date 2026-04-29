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
  /** dd/MM/yyyy */
  routeDate: string;
  contactName: string;
  /** Documento o teléfono abreviado para filtros */
  contactIdentifier: string;
  /** yyyy-MM-dd para ordenar/filtrar */
  routeDateIso: string;
  /** Para filtro "fecha de creación" */
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

export const orders: Order[] = [
  {
    id: "ORD-2604-001",
    status: "in_route",
    substatus: "Despacho parcial",
    vehiclePlate: "BFS-748",
    clientName: "Distribuidora Norte S.A.",
    routeDate: "28/04/2026",
    contactName: "María Quispe",
    contactIdentifier: "DNI ****7821",
    routeDateIso: "2026-04-28",
    createdAtIso: "2026-04-27",
    isLastDispatch: false,
  },
  {
    id: "ORD-2604-002",
    status: "preparing",
    substatus: "Armar carga",
    vehiclePlate: "BHT-734",
    clientName: "Retail Lima Centro",
    routeDate: "28/04/2026",
    contactName: "Carlos Mendoza",
    contactIdentifier: "Tel +51 *** *** 441",
    routeDateIso: "2026-04-28",
    createdAtIso: "2026-04-26",
    isLastDispatch: false,
  },
  {
    id: "ORD-2604-003",
    status: "delivered",
    substatus: "Cerrado",
    vehiclePlate: "BKT-760",
    clientName: "Supermercados Sur",
    routeDate: "27/04/2026",
    contactName: "Ana López",
    contactIdentifier: "RUC 20******91",
    routeDateIso: "2026-04-27",
    createdAtIso: "2026-04-25",
    isLastDispatch: true,
  },
  {
    id: "ORD-2604-004",
    status: "pending",
    substatus: "Sin asignar",
    vehiclePlate: "—",
    clientName: "Importaciones Este",
    routeDate: "29/04/2026",
    contactName: "Pedro Ramos",
    contactIdentifier: "DNI ****9034",
    routeDateIso: "2026-04-29",
    createdAtIso: "2026-04-24",
    isLastDispatch: false,
  },
  {
    id: "ORD-2604-005",
    status: "in_route",
    substatus: "Último despacho",
    vehiclePlate: "CAG-900",
    clientName: "Logística Oeste",
    routeDate: "28/04/2026",
    contactName: "Lucía Fernández",
    contactIdentifier: "Tel +51 *** *** 118",
    routeDateIso: "2026-04-28",
    createdAtIso: "2026-04-28",
    isLastDispatch: true,
  },
  {
    id: "ORD-2604-006",
    status: "cancelled",
    substatus: "Cliente anuló",
    vehiclePlate: "DVR-221",
    clientName: "Textiles SAC",
    routeDate: "26/04/2026",
    contactName: "María García",
    contactIdentifier: "RUC 10******55",
    routeDateIso: "2026-04-26",
    createdAtIso: "2026-04-20",
    isLastDispatch: false,
  },
  {
    id: "ORD-2604-007",
    status: "delivered",
    substatus: "Cerrado",
    vehiclePlate: "BFS-748",
    clientName: "Farmacia Central",
    routeDate: "25/04/2026",
    contactName: "Jorge Ilizarbe",
    contactIdentifier: "DNI ****2210",
    routeDateIso: "2026-04-25",
    createdAtIso: "2026-04-22",
    isLastDispatch: false,
  },
  {
    id: "ORD-2604-008",
    status: "preparing",
    substatus: "Validación documentos",
    vehiclePlate: "BHT-734",
    clientName: "Clínica San José",
    routeDate: "30/04/2026",
    contactName: "Rosa Medina",
    contactIdentifier: "Tel +51 *** *** 902",
    routeDateIso: "2026-04-30",
    createdAtIso: "2026-04-29",
    isLastDispatch: false,
  },
  {
    id: "ORD-2604-009",
    status: "in_route",
    substatus: "Despacho parcial",
    vehiclePlate: "BKT-760",
    clientName: "Panadería La Unión",
    routeDate: "28/04/2026",
    contactName: "Emerson Tineo",
    contactIdentifier: "DNI ****6655",
    routeDateIso: "2026-04-28",
    createdAtIso: "2026-04-27",
    isLastDispatch: false,
  },
  {
    id: "ORD-2604-010",
    status: "pending",
    substatus: "Pendiente programación",
    vehiclePlate: "—",
    clientName: "Electro Hogar",
    routeDate: "02/05/2026",
    contactName: "Diego Salas",
    contactIdentifier: "RUC 20******02",
    routeDateIso: "2026-05-02",
    createdAtIso: "2026-04-30",
    isLastDispatch: false,
  },
];

export const orderSubstatusOptions = Array.from(
  new Set(orders.map((o) => o.substatus)),
).sort();

export const vehiclePlatesInOrders = Array.from(
  new Set(orders.map((o) => o.vehiclePlate).filter((p) => p !== "—")),
).sort();
