import type { FleetDevice, FleetDeviceStatus } from "@/domain/fleet";
import { apiGet } from "@/lib/api";
import { endpoints } from "./endpoints";

function devicesUrl(): string {
  return import.meta.env.VITE_FLEET_ONWAY_MAP === "true"
    ? endpoints.fleetDevicesOnWayMap
    : endpoints.fleetDevices;
}

const STATUSES: FleetDeviceStatus[] = ["in_route", "stopped", "offline"];

function isFleetStatus(s: string): s is FleetDeviceStatus {
  return (STATUSES as readonly string[]).includes(s);
}

function normalizeFleetDevice(raw: unknown): FleetDevice {
  const r = raw as Record<string, unknown>;
  const statusStr = String(r.status ?? "offline");
  const aliasRaw = r.alias;
  const alias =
    aliasRaw != null && String(aliasRaw).trim() !== "" ? String(aliasRaw).trim() : null;
  const sk = r.speedKmh;
  const speedKmh =
    typeof sk === "number" && Number.isFinite(sk) ? sk : Number(sk ?? 0) || 0;

  return {
    id: String(r.id ?? ""),
    plate: String(r.plate ?? ""),
    imei: String(r.imei ?? ""),
    lat: Number(r.lat ?? 0),
    lng: Number(r.lng ?? 0),
    status: isFleetStatus(statusStr) ? statusStr : "offline",
    batteryPct: Math.min(100, Math.max(0, Number(r.batteryPct ?? 0))),
    signalBars: Math.min(4, Math.max(1, Math.round(Number(r.signalBars ?? 1)))),
    lastSeenIso: String(r.lastSeenIso ?? new Date().toISOString()),
    alias,
    speedKmh,
  };
}

export const fleetApi = {
  listDevices(): Promise<FleetDevice[]> {
    return apiGet<unknown[]>(devicesUrl()).then((rows) => rows.map(normalizeFleetDevice));
  },
};
