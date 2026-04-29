/**
 * Datos de referencia para el dashboard. Sustituir por API / React Query.
 */

/** Órdenes por día (últimos 7 días laborables). */
export const dashboardOrdersTrend = [
  { label: "Lun", ordenes: 118 },
  { label: "Mar", ordenes: 132 },
  { label: "Mié", ordenes: 125 },
  { label: "Jue", ordenes: 141 },
  { label: "Vie", ordenes: 138 },
  { label: "Sáb", ordenes: 98 },
  { label: "Dom", ordenes: 142 },
];

export const dashboardOrderStatusBreakdown = [
  { key: "pending", label: "Pendiente", count: 28 },
  { key: "preparing", label: "En preparación", count: 19 },
  { key: "in_route", label: "En ruta", count: 44 },
  { key: "delivered", label: "Entregado", count: 41 },
  { key: "cancelled", label: "Cancelado", count: 10 },
];

export interface DashboardAlert {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  timeLabel: string;
}

export const dashboardAlerts: DashboardAlert[] = [
  {
    id: "a1",
    type: "warning",
    title: "BHT-734: demora > 25 min en punto de entrega",
    timeLabel: "Hace 12 min",
  },
  {
    id: "a2",
    type: "info",
    title: "Ruta R-204 programada inicia en 30 min",
    timeLabel: "Hace 35 min",
  },
  {
    id: "a3",
    type: "success",
    title: "ORD-2604-003 entregada — SLA cumplido",
    timeLabel: "Hace 1 h",
  },
  {
    id: "a4",
    type: "warning",
    title: "2 vehículos sin actualización GPS > 15 min",
    timeLabel: "Hace 2 h",
  },
];

export interface DashboardActiveRoute {
  id: string;
  name: string;
  stopsDone: number;
  stopsTotal: number;
  vehiclePlate: string;
}

export const dashboardActiveRoutes: DashboardActiveRoute[] = [
  { id: "R-201", name: "Ruta Norte — distribución", stopsDone: 7, stopsTotal: 12, vehiclePlate: "BFS-748" },
  { id: "R-204", name: "Ruta Centro retail", stopsDone: 4, stopsTotal: 9, vehiclePlate: "BHT-734" },
  { id: "R-208", name: "Ruta Sur frío", stopsDone: 11, stopsTotal: 14, vehiclePlate: "BKT-760" },
  { id: "R-215", name: "Express Miraflores", stopsDone: 2, stopsTotal: 6, vehiclePlate: "CAG-900" },
];
