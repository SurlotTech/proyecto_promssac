import { parseISO } from "date-fns";
import type { Locale } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

/** Zona horaria de operación de la flota (coincide con backend Lima). */
export const FLEET_TIMEZONE = "America/Lima";

/** Fecha calendario yyyy-MM-dd en Lima para filtrar por día de reporte. */
export function instantIsoToFleetCalendarDateKey(iso: string): string {
  return formatInTimeZone(parseISO(iso), FLEET_TIMEZONE, "yyyy-MM-dd");
}

export function formatFleetDateTime(iso: string, pattern: string, locale: Locale = es): string {
  return formatInTimeZone(parseISO(iso), FLEET_TIMEZONE, pattern, { locale });
}

/** Hoy en calendario Lima (yyyy-MM-dd) para el filtro por defecto en Flota. */
export function fleetCalendarTodayKey(): string {
  return formatInTimeZone(new Date(), FLEET_TIMEZONE, "yyyy-MM-dd");
}
