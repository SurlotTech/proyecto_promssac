import { apiDelete, apiGet, apiPost } from "@/lib/api";

export interface UbicacionUsuario {
  userId: string;
  userName: string;
  lat: number;
  lng: number;
  lastSeenIso: string;
  speedKmh?: number;
}

export const gpsApi = {
  enviarUbicacion(lat: number, lng: number): Promise<void> {
    return apiPost<void, { lat: number; lng: number }>("/api/v1/gps/ubicacion", { lat, lng });
  },

  listarUbicaciones(): Promise<UbicacionUsuario[]> {
    return apiGet<UbicacionUsuario[]>("/api/v1/gps/ubicaciones");
  },

  eliminarUbicacion(): Promise<void> {
    return apiDelete("/api/v1/gps/ubicacion");
  },
};
