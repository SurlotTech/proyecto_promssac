export function localCalendarDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

import { instantIsoToFleetCalendarDateKey } from "./fleetDateTime";

/** Día civil en América/Lima del instante ISO (alineado con cómo se muestra la flota). */
export function instantIsoToLocalDateKey(iso: string): string {
  return instantIsoToFleetCalendarDateKey(iso);
}
