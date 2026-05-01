import { useQuery } from "@tanstack/react-query";
import { fleetApi, ordersApi, routesApi, vehiclesApi } from "@/services";

export function useVehiclesQuery() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: () => vehiclesApi.list(),
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
