import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Client } from "@/domain/clients";
import {
  MIN_CHARS_BUSCAR_DIRECCION,
  tieneCoordsMapa,
  ubicacionDesdeGeocodeDto,
} from "@/lib/clienteFormMap";
import { geocodificacionApi, type GeocodificacionDto } from "@/services/geocodificacion.api";
import { errorMessageFromUnknown } from "@/lib/utils";
import { toast } from "sonner";

type Params = {
  open: boolean;
  editing: Client | null;
  direccion: string;
  setDireccion: (v: string) => void;
  latitud: number | null;
  longitud: number | null;
  setLatitud: (v: number | null) => void;
  setLongitud: (v: number | null) => void;
  setUbicacionMapaLimpiar: (v: boolean) => void;
  /** Rellena todos los campos del formulario desde el cliente (o vacía si es alta nueva). */
  hydrateFormFromEditing: (client: Client | null) => void;
};

/**
 * Sesión del mapa, geocodificación manual (botón Buscar) y una sola geocodificación automática
 * cuando hay dirección pero faltan coordenadas — coherente con ClientFormDialog.
 */
export function useClientFormUbicacionMap({
  open,
  editing,
  direccion,
  setDireccion,
  latitud,
  longitud,
  setLatitud,
  setLongitud,
  setUbicacionMapaLimpiar,
  hydrateFormFromEditing,
}: Params) {
  const [mapSession, setMapSession] = useState("");
  const [mapLocationNonce, setMapLocationNonce] = useState(0);
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);
  const autoGeocodMapSessionRef = useRef<string | null>(null);

  const aplicarGeocodeEnForm = useCallback((dto: GeocodificacionDto) => {
    const u = ubicacionDesdeGeocodeDto(dto);
    setDireccion(u.direccion);
    setLatitud(u.latitud);
    setLongitud(u.longitud);
    setUbicacionMapaLimpiar(false);
    setMapLocationNonce((n) => n + 1);
  }, [setDireccion, setLatitud, setLongitud, setUbicacionMapaLimpiar]);

  useLayoutEffect(() => {
    if (!open) {
      setMapSession("");
      autoGeocodMapSessionRef.current = null;
      return;
    }
    hydrateFormFromEditing(editing);
    setMapLocationNonce(0);
    setMapSession(`${editing?.id ?? "nuevo"}-${Date.now()}`);
  }, [open, editing, hydrateFormFromEditing]);

  useEffect(() => {
    if (!open || !mapSession) return;
    if (tieneCoordsMapa(latitud, longitud)) return;
    const q = direccion.trim();
    if (q.length < MIN_CHARS_BUSCAR_DIRECCION) return;
    if (autoGeocodMapSessionRef.current === mapSession) return;
    autoGeocodMapSessionRef.current = mapSession;
    let cancelled = false;
    void geocodificacionApi
      .buscar(q)
      .then((r) => {
        if (cancelled) return;
        aplicarGeocodeEnForm(r);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, mapSession, latitud, longitud, direccion, aplicarGeocodeEnForm]);

  const buscarDireccionPorTexto = useCallback(async () => {
    const t = direccion.trim();
    if (t.length < MIN_CHARS_BUSCAR_DIRECCION) {
      toast.message("Escribí al menos 4 caracteres para buscar.");
      return;
    }
    setBuscandoDireccion(true);
    try {
      const r = await geocodificacionApi.buscar(t);
      aplicarGeocodeEnForm(r);
      toast.success("Ubicación encontrada; revisá el mapa.");
    } catch (e: unknown) {
      toast.error(errorMessageFromUnknown(e, "No se encontró esa dirección."));
    } finally {
      setBuscandoDireccion(false);
    }
  }, [direccion, aplicarGeocodeEnForm]);

  const mapSessionKey = mapSession ? `${mapSession}-${mapLocationNonce}` : "";

  return {
    mapSession,
    mapSessionKey,
    buscandoDireccion,
    buscarDireccionPorTexto,
  };
}
