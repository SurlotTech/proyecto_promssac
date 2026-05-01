import { useQuery } from "@tanstack/react-query";
import { fleetApi, mobileUsersApi, ordersApi, routesApi, vehiclesApi, webUsersApi } from "@/services";

export function useVehiclesQuery() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: () => vehiclesApi.list(),
  });
}

/** Solo id, plate, type — para combos (menos datos que list()). */
export function useVehicleOptionsQuery() {
  return useQuery({
    queryKey: ["vehicles", "opciones"],
    queryFn: () => vehiclesApi.listOpciones(),
  });
}

export function useMobileUsersQuery() {
  return useQuery({
    queryKey: ["usuarios-movil"],
    queryFn: () => mobileUsersApi.list(),
  });
}

/** id + nombre + vehiculoId; solo activos — modal / filtros ligeros de rutas. */
export function useMobileUserRouteOptionsQuery() {
  return useQuery({
    queryKey: ["usuarios-movil", "opciones-ruta"],
    queryFn: () => mobileUsersApi.listRouteOptions(),
  });
}

export function useWebUsersQuery() {
  return useQuery({
    queryKey: ["usuarios-web"],
    queryFn: () => webUsersApi.list(),
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

export function useOrdersQuery() {
  return useQuery({
    queryKey: ["ordenes"],
    queryFn: () => ordersApi.list(),
  });
}

export function useFleetDevicesQuery() {
  const mapMode = import.meta.env.VITE_FLEET_ONWAY_MAP === "true";
  return useQuery({
    queryKey: ["flota-dispositivos", mapMode ? "map" : "detail"],
    queryFn: () => fleetApi.listDevices(),
  });
}
