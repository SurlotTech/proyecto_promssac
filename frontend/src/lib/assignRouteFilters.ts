import { format } from "date-fns";
import type { Route, RouteStatus } from "@/domain/routes";
import { routeDeliveryUiToIso } from "@/domain/routes";
import type { Order } from "@/domain/orders";

export type AssignOrderStatusFilter = "all" | "pending" | "preparing";
export type AssignRouteStatusFilter = "all" | RouteStatus;

export function formatAssignDayIso(day: Date): string {
  return format(day, "yyyy-MM-dd");
}

function routeOnSameDay(route: Route, day: Date): boolean {
  const iso = routeDeliveryUiToIso(route.deliveryDate);
  return Boolean(iso && iso === formatAssignDayIso(day));
}

function orderOnSameDay(order: Order, day: Date): boolean {
  return (order as any).startDate === formatAssignDayIso(day);
}

function orderIsCandidate(order: Order): boolean {
  return order.status === "pending" || order.status === "preparing";
}

function orderMatchesStatusFilter(order: Order, f: AssignOrderStatusFilter): boolean {
  if (!orderIsCandidate(order)) return false;
  if (f === "all") return true;
  return order.status === f;
}

function routeMatchesStatusFilter(route: Route, f: AssignRouteStatusFilter): boolean {
  if (f === "all") return true;
  return route.status === f;
}

export function filterOrdersForAssignPanel(
  allOrders: Order[],
  day: Date,
  statusFilter: AssignOrderStatusFilter,
  search: string,
): Order[] {
  const q = search.trim().toLowerCase();
  return allOrders.filter((o) => {
    if (!orderOnSameDay(o, day) || !orderMatchesStatusFilter(o, statusFilter)) return false;
    if (!q) return true;
    return (
      o.id.toLowerCase().includes(q) ||
      o.clientName.toLowerCase().includes(q) ||
      o.contactName.toLowerCase().includes(q) ||
      o.vehiclePlate.toLowerCase().includes(q)
    );
  });
}

export function filterRoutesForAssignPanel(
  routes: Route[],
  day: Date,
  statusFilter: AssignRouteStatusFilter,
  search: string,
): Route[] {
  const q = search.trim().toLowerCase();
  return routes.filter((r) => {
    if (!routeOnSameDay(r, day) || !routeMatchesStatusFilter(r, statusFilter)) return false;
    if (!q) return true;
    return (
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.vehiclePlate.toLowerCase().includes(q) ||
      (r.mobileUser && r.mobileUser.toLowerCase().includes(q))
    );
  });
}
