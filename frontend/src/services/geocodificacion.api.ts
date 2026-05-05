import { apiGet } from "@/lib/api";
import { endpoints } from "./endpoints";

export interface GeocodificacionDto {
  displayName: string;
  lat: number;
  lon: number;
}

export const geocodificacionApi = {
  reversa(lat: number, lon: number): Promise<GeocodificacionDto> {
    return apiGet<GeocodificacionDto>(
      `${endpoints.geocodificacion}/reversa?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`,
    );
  },

  buscar(consulta: string): Promise<GeocodificacionDto> {
    const q = new URLSearchParams({ q: consulta.trim() });
    return apiGet<GeocodificacionDto>(`${endpoints.geocodificacion}/buscar?${q}`);
  },
};
