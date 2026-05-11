import type { GeocodificacionDto } from "@/services/geocodificacion.api";

export const MAX_DIRECCION_CLIENTE = 300;
export const MIN_CHARS_BUSCAR_DIRECCION = 4;

/** Normaliza lat/lng que a veces vienen como string en JSON. */
export function parseCoordClienteApi(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = parseFloat(String(v).trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function tieneCoordsMapa(lat: number | null, lng: number | null): boolean {
  return lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
}

export function clipDireccionNominatim(displayName: string): string {
  return displayName.trim().slice(0, MAX_DIRECCION_CLIENTE);
}

/** Resultado de Nominatim → estado del formulario (dirección + coords + mapa). */
export type UbicacionGeocodeAplicada = {
  direccion: string;
  latitud: number;
  longitud: number;
};

export function ubicacionDesdeGeocodeDto(dto: GeocodificacionDto): UbicacionGeocodeAplicada {
  return {
    direccion: clipDireccionNominatim(dto.displayName ?? ""),
    latitud: dto.lat,
    longitud: dto.lon,
  };
}
