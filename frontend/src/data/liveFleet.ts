/**
 * Datos demo para Flota en vivo. Sustituir por llamadas API (lista + última posición).
 * Coordenadas referencia: Lima, Perú.
 */

export type FleetDeviceStatus = "in_route" | "stopped" | "offline";

export interface FleetGroup {
  id: string;
  label: string;
}

export interface FleetDevice {
  id: string;
  plate: string;
  imei: string;
  lat: number;
  lng: number;
  status: FleetDeviceStatus;
  groupId: string | null;
  batteryPct: number;
  /** 1–4 barras de señal */
  signalBars: 1 | 2 | 3 | 4;
  /** ISO 8601 — último reporte */
  lastSeenIso: string;
}

export const fleetGroups: FleetGroup[] = [
  { id: "ungrouped", label: "Sin agrupar" },
  { id: "lima-norte", label: "Lima Norte" },
  { id: "lima-sur", label: "Lima Sur" },
];

/** Centro por defecto del mapa (Lima). */
export const LIMA_CENTER: [number, number] = [-12.0464, -77.0428];

export const fleetDevices: FleetDevice[] = [
  {
    id: "dev-1",
    plate: "BFS-748",
    imei: "864292045257688",
    lat: -12.0468,
    lng: -77.0435,
    status: "in_route",
    groupId: "lima-norte",
    batteryPct: 100,
    signalBars: 4,
    lastSeenIso: "2026-04-28T20:27:40-05:00",
  },
  {
    id: "dev-2",
    plate: "BHT-734",
    imei: "864292045257689",
    lat: -12.095,
    lng: -77.015,
    status: "in_route",
    groupId: "lima-norte",
    batteryPct: 92,
    signalBars: 3,
    lastSeenIso: "2026-04-28T20:25:12-05:00",
  },
  {
    id: "dev-3",
    plate: "CAG-900",
    imei: "864292045257690",
    lat: -12.135,
    lng: -77.022,
    status: "stopped",
    groupId: null,
    batteryPct: 78,
    signalBars: 2,
    lastSeenIso: "2026-04-28T19:58:00-05:00",
  },
  {
    id: "dev-4",
    plate: "DVR-221",
    imei: "864292045257691",
    lat: -12.08,
    lng: -76.98,
    status: "offline",
    groupId: "lima-sur",
    batteryPct: 41,
    signalBars: 1,
    lastSeenIso: "2026-04-27T08:12:00-05:00",
  },
];

export const fleetStatusLabels: Record<FleetDeviceStatus, string> = {
  in_route: "En ruta",
  stopped: "Detenido",
  offline: "Sin señal",
};
