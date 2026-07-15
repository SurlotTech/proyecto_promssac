export type FleetDeviceStatus = "in_route" | "stopped" | "offline";

export interface FleetDevice {
  id: string;
  plate: string;
  imei: string;
  lat: number;
  lng: number;
  status: FleetDeviceStatus;
  batteryPct: number;
  signalBars: number;
  lastSeenIso: string;
  /** Alias / nombre corto del proveedor GPS; null si no aplica. */
  alias: string | null;
  /** km/h instantáneo; 0 si no se conoce. */
  speedKmh: number;
}

export const LIMA_CENTER: [number, number] = [-12.0464, -77.0428];

export const fleetStatusLabels: Record<FleetDeviceStatus, string> = {
  in_route: "En ruta",
  stopped: "Detenido",
  offline: "Sin señal",
};
