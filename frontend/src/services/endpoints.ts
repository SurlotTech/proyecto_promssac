const V1 = "/api/v1";

export const endpoints = {
  usuariosWeb: `${V1}/usuarios-web`,
  usuariosMovil: `${V1}/usuarios-movil`,
  /** id, nombreCompleto, vehiculoId — solo activos; modal rutas */
  usuariosMovilOpcionesRuta: `${V1}/usuarios-movil/opciones/ruta`,
  vehicles: `${V1}/vehiculos`,
  /** Listado mínimo (id, plate, type) para combos */
  vehiclesOpciones: `${V1}/vehiculos/opciones`,
  routes: `${V1}/rutas`,
  orders: `${V1}/ordenes`,
  fleetDevices: `${V1}/flota/dispositivos`,
  fleetDevicesOnWayMap: `${V1}/flota/dispositivos/onway-map`,
} as const;
