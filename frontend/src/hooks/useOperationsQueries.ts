import { useQuery } from "@tanstack/react-query";
import { fleetApi, mobileUsersApi, ordersApi, routesApi, vehiclesApi, webRolesApi, webUsersApi, clientsApi } from "@/services";
import { estadosApi } from "@/services/estados.api";

export function useVehiclesQuery() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: () => vehiclesApi.list(),
  });
}

/** Solo id, plate, type — para combos (menos datos que list()). */
export function useVehicleOptionsQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: ["vehicles", "opciones"],
    queryFn: () => vehiclesApi.listOpciones(),
    enabled,
  });
}

export function useMobileUsersQuery(incluirInactivos: boolean = false) {
  return useQuery({
    queryKey: ["usuarios-movil", incluirInactivos],
    queryFn: () => mobileUsersApi.list(incluirInactivos),
  });
}

/** id + nombre + vehiculoId; solo activos — modal / filtros ligeros de rutas. */
export function useMobileUserRouteOptionsQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: ["usuarios-movil", "opciones-ruta"],
    queryFn: () => mobileUsersApi.listRouteOptions(),
    enabled,
  });
}

export function useWebUsersQuery(incluirInactivos: boolean = false) {
  return useQuery({
    queryKey: ["usuarios-web", incluirInactivos],
    queryFn: () => webUsersApi.list(incluirInactivos),
  });
}

export function useWebRolesQuery() {
  return useQuery({
    queryKey: ["roles-web"],
    queryFn: () => webRolesApi.list(),
  });
}

export function useWebRoleOptionsQuery() {
  return useQuery({
    queryKey: ["roles-web", "opciones"],
    queryFn: () => webRolesApi.listOpciones(),
  });
}

export function useWebRoleDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["rol-web", id],
    queryFn: () => webRolesApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useWebUserDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["usuario-web", id],
    queryFn: () => webUsersApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useMobileUserDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["usuario-movil", id],
    queryFn: () => mobileUsersApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useRoutesQuery() {
  return useQuery({
    queryKey: ["rutas"],
    queryFn: () => routesApi.list(),
  });
}

export function useRouteOrdersQuery(routeId: string | undefined) {
  return useQuery({
    queryKey: ["rutas", routeId, "ordenes"],
    queryFn: () => routesApi.listOrdersForRoute(routeId!),
    enabled: Boolean(routeId?.trim()),
  });
}

export function useOrdersQuery() {
  return useQuery({
    queryKey: ["ordenes"],
    queryFn: () => ordersApi.list(),
  });
}

export function useAlertOrdersQuery() {
  return useQuery({
    queryKey: ["ordenes", "alertas"],
    queryFn: () => ordersApi.listAlertas(),
  });
}

/** Una orden por número (pantalla detalle sin depender de la lista cargada). */
export function useOrderDetailQuery(numeroOrden: string | undefined) {
  const trimmed = numeroOrden?.trim();
  return useQuery({
    queryKey: ["ordenes", "detalle", trimmed],
    queryFn: () => ordersApi.getByNumero(trimmed!),
    enabled: Boolean(trimmed),
  });
}

/** Líneas de productos de una orden (GET `{numero}/productos`). */
export function useOrderProductLinesQuery(numeroOrden: string | undefined) {
  const trimmed = numeroOrden?.trim();
  return useQuery({
    queryKey: ["ordenes", trimmed, "productos"],
    queryFn: () => ordersApi.listProductLines(trimmed!),
    enabled: Boolean(trimmed),
  });
}

export function useFleetDevicesQuery() {
  const mapMode = import.meta.env.VITE_FLEET_ONWAY_MAP === "true";
  return useQuery({
    queryKey: ["flota-dispositivos", mapMode ? "map" : "detail"],
    queryFn: () => fleetApi.listDevices(),
  });
}

export function useClientsQuery(incluirInactivos: boolean) {
  return useQuery({
    queryKey: ["clientes", "lista", incluirInactivos],
    queryFn: () => clientsApi.list(incluirInactivos),
  });
}

export function useClientDetailQuery(clientId: string | undefined) {
  const trimmed = clientId?.trim();
  return useQuery({
    queryKey: ["clientes", "detalle", trimmed],
    queryFn: () => clientsApi.get(trimmed!),
    enabled: Boolean(trimmed),
  });
}

export function useClientOrdersQuery(clientId: string | undefined) {
  const trimmed = clientId?.trim();
  return useQuery({
    queryKey: ["clientes", trimmed, "ordenes"],
    queryFn: () => clientsApi.ordersForClient(trimmed!),
    enabled: Boolean(trimmed),
  });
}

export function useEstadosPadresQuery(incluirInactivos: boolean = false) {
  return useQuery({
    queryKey: ["estados", "padres", incluirInactivos],
    queryFn: () => estadosApi.listarPadres(incluirInactivos),
  });
}

export function useEstadosHijosPorClaveQuery(nombrePadre: string | undefined) {
  return useQuery({
    queryKey: ["estados", "hijos", "nombre", nombrePadre],
    queryFn: () => estadosApi.listarHijosPorNombrePadre(nombrePadre!),
    enabled: Boolean(nombrePadre),
  });
}

