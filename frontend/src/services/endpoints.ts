const V1 = "/api/v1";

export const endpoints = {
  vehicles: `${V1}/vehiculos`,
  routes: `${V1}/rutas`,
  orders: `${V1}/ordenes`,
  fleetDevices: `${V1}/flota/dispositivos`,
  fleetDevicesOnWayMap: `${V1}/flota/dispositivos/onway-map`,
} as const;
