const V1 = "/api/v1";

export const endpoints = {
  usuariosWeb: `${V1}/usuarios-web`,
  rolesWeb: `${V1}/roles-web`,
  usuariosMovil: `${V1}/usuarios-movil`,
  usuariosMovilOpcionesRuta: `${V1}/usuarios-movil/opciones/ruta`,
  vehicles: `${V1}/vehiculos`,
  vehiclesOpciones: `${V1}/vehiculos/opciones`,
  routes: `${V1}/rutas`,
  orders: `${V1}/ordenes`,
  fleetDevices: `${V1}/flota/dispositivos`,
  fleetDevicesOnWayMap: `${V1}/flota/dispositivos/onway-map`,
  /** Proxy RENIEC/SUNAT vía backend (token en servidor). */
  consultas: `${V1}/consultas`,
  /** Nominatim vía backend (User-Agent correcto). */
  geocodificacion: `${V1}/geocodificacion`,
} as const;
