import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { Button } from "@/components/ui/button";
import { PromssacMap, type PromssacMapRef } from "@/components/maps";
import { MAX_DIRECCION_CLIENTE } from "@/lib/clienteFormMap";
import { runWhenMapAndMarkerReady } from "@/lib/maplibreFollowCoords";
import { cn, errorMessageFromUnknown } from "@/lib/utils";
import { geocodificacionApi } from "@/services/geocodificacion.api";
import { toast } from "sonner";

const PERU_LNG_LAT: [number, number] = [-75.15, -9.12];

type Props = {
  /** Reinicia el mapa al abrir el diálogo o al pasar a otro cliente (no en cada reversa). */
  sessionKey: string;
  mode: "edit" | "view";
  initialLat: number | null;
  initialLng: number | null;
  className?: string;
  onLocationResolved?: (lat: number, lng: number, direccionReal: string) => void;
  onClearLocation?: () => void;
};

export function ClienteMaplibreUbicacion({
  sessionKey,
  mode,
  initialLat,
  initialLng,
  className,
  onLocationResolved,
  onClearLocation,
}: Props) {
  const mapRef = useRef<PromssacMapRef>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onPickRef = useRef(onLocationResolved);
  onPickRef.current = onLocationResolved;

  const hasPoint =
    initialLat != null && initialLng != null && Number.isFinite(initialLat) && Number.isFinite(initialLng);

  const hp =
    initialLat != null && initialLng != null && Number.isFinite(initialLat) && Number.isFinite(initialLng);
  const startLng = hp ? initialLng! : PERU_LNG_LAT[0];
  const startLat = hp ? initialLat! : PERU_LNG_LAT[1];
  const startZoom = hp ? (mode === "view" ? 16 : 15) : 5;

  /** Aplica centro/pin cuando cambian las coords o la sesión del mapa; reintenta hasta que existan map y marker. */
  useEffect(() => {
    if (initialLat == null || initialLng == null || !Number.isFinite(initialLat) || !Number.isFinite(initialLng)) {
      return;
    }
    return runWhenMapAndMarkerReady(mapRef, markerRef, (map, marker) => {
      marker.setLngLat([initialLng, initialLat]);
      map.flyTo({
        center: [initialLng, initialLat],
        zoom: mode === "view" ? 16 : 15,
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      });
    });
  }, [initialLat, initialLng, mode, sessionKey]);

  return (
    <div className={cn(className)}>
      <PromssacMap
        ref={mapRef}
        mapKey={sessionKey}
        center={[startLng, startLat]}
        zoom={startZoom}
        containerClassName="h-[min(280px,45vh)] w-full"
        onMap={(map) => {
          const marker = new maplibregl.Marker({
            color: "hsl(217 91% 60%)",
            draggable: mode === "edit",
          })
            .setLngLat([startLng, startLat])
            .addTo(map);
          markerRef.current = marker;

          const aplicarGeocodigo = async (lat: number, lng: number) => {
            const fn = onPickRef.current;
            if (mode !== "edit" || !fn) return;
            try {
              const r = await geocodificacionApi.reversa(lat, lng);
              const dir = (r.displayName ?? "").trim().slice(0, MAX_DIRECCION_CLIENTE);
              fn(lat, lng, dir);
            } catch (e: unknown) {
              toast.error(errorMessageFromUnknown(e, "No se pudo obtener la dirección desde el mapa."));
              fn(lat, lng, "");
            }
          };

          const onDragEnd = () => {
            const ll = marker.getLngLat();
            void aplicarGeocodigo(ll.lat, ll.lng);
          };

          const onMapClick = (ev: maplibregl.MapMouseEvent) => {
            marker.setLngLat(ev.lngLat);
            void aplicarGeocodigo(ev.lngLat.lat, ev.lngLat.lng);
          };

          if (mode === "edit") {
            marker.on("dragend", onDragEnd);
            map.on("click", onMapClick);
          }

          return () => {
            if (mode === "edit") {
              marker.off("dragend", onDragEnd);
              map.off("click", onMapClick);
            }
            marker.remove();
            markerRef.current = null;
          };
        }}
      />
      {mode === "edit" && onClearLocation ? (
        <div className="mt-2 flex justify-end">
          <Button type="button" variant="outline" size="sm" className="shrink-0 text-xs" onClick={onClearLocation}>
            Quitar ubicación
          </Button>
        </div>
      ) : null}
    </div>
  );
}
