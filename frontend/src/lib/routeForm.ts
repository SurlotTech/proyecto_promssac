import type { MobileUserRouteOption } from "@/domain/mobileUsers";
import type { Route } from "@/domain/routes";
import { routeDeliveryUiToIso } from "@/domain/routes";
import type { VehicleOption } from "@/domain/vehicles";
import type { RouteWriteBody } from "@/services/routes.api";

export type RouteFormState = {
  routeCode: string;
  routeName: string;
  mobileUserId: string;
  vehicleId: string;
  dispatchDate: string;
  maxDeliveryDate: string;
  minGapMinutes: string;
};

export function emptyRouteForm(): RouteFormState {
  return {
    routeCode: "",
    routeName: "",
    mobileUserId: "",
    vehicleId: "",
    dispatchDate: "",
    maxDeliveryDate: "",
    minGapMinutes: "20",
  };
}

export function routeToFormState(route: Route, mobileUsers: MobileUserRouteOption[]): RouteFormState {
  const nameMatch = route.mobileUser?.trim();
  const matched = nameMatch
    ? mobileUsers.find((m) => m.nombreCompleto.trim() === nameMatch)
    : undefined;
  const isoDate = routeDeliveryUiToIso(route.deliveryDate);

  return {
    routeCode: route.code ?? "",
    routeName: route.name,
    mobileUserId: matched?.id ?? "",
    vehicleId: route.vehicleId,
    dispatchDate: isoDate,
    maxDeliveryDate: isoDate,
    minGapMinutes: "20",
  };
}

export function vehicleIdForMobileUser(
  mobileId: string,
  mobileUsers: MobileUserRouteOption[],
  vehicles: VehicleOption[],
): string {
  const u = mobileUsers.find((m) => m.id === mobileId);
  if (!u?.vehiculoId) return "";
  return vehicles.some((v) => v.id === u.vehiculoId) ? u.vehiculoId : "";
}

export function buildRouteWriteBody(form: RouteFormState, editing: Route | null): RouteWriteBody {
  if (editing) {
    return {
      codigo: form.routeCode.trim() || editing.code,
      nombre: form.routeName.trim(),
      vehiculoId: form.vehicleId,
      usuarioMovilId: form.mobileUserId || null,
      fechaEntrega: form.dispatchDate,
      prioridad: editing.priority,
      estado: editing.status,
      lugar: editing.place?.trim() ? editing.place : "",
      despachosCompletados: editing.dispatchCompleted,
      despachosTotales: editing.dispatchTotal,
      cobroActual: editing.currentCollection,
      cobroTotal: editing.totalCollection,
      montoEnRuta: editing.amountInRoute,
    };
  }

  const body: RouteWriteBody = {
    nombre: form.routeName.trim(),
    vehiculoId: form.vehicleId,
    usuarioMovilId: form.mobileUserId || null,
    fechaEntrega: form.dispatchDate,
    prioridad: "medium",
    estado: "scheduled",
    lugar: "",
    despachosCompletados: 0,
    despachosTotales: 0,
    cobroActual: 0,
    cobroTotal: 0,
    montoEnRuta: 0,
  };
  if (form.routeCode.trim()) {
    body.codigo = form.routeCode.trim();
  }
  return body;
}
