import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  PROMSSAC_MAP_STYLES,
  type PromssacMapStyleKey,
  add3dBuildingsToMap,
} from "@/lib/promssacMapStyles";
import type { UbicacionUsuario } from "@/services";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

function createFlotaMarkerEl() {
  const el = document.createElement("div");
  el.innerHTML = `<div style="width:28px;height:28px;border-radius:50%;background:hsl(221 83% 53%);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9" opacity="0.4"/></svg>
  </div>`;
  return el;
}

function buildPopupHTML(u: UbicacionUsuario) {
  return `<div style="font-size:14px">
    <p style="font-weight:600">${u.userName}</p>
    <p style="color:#6b7280;font-size:12px">Lat: ${u.lat.toFixed(6)} · Lng: ${u.lng.toFixed(6)}</p>
    <p style="color:#6b7280;font-size:12px">${u.lastSeenIso}</p>
  </div>`;
}

function tiempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `hace ${sec} s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `hace ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} d`;
}

interface FlotaLiveMapProps {
  ubicaciones: UbicacionUsuario[];
  className?: string;
  containerClassName?: string;
}

const FlotaLiveMap = ({
  ubicaciones,
  className,
  containerClassName,
}: FlotaLiveMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [styleKey, setStyleKey] = useState<PromssacMapStyleKey>("default");
  const hasFlown = useRef(false);

  const ubicacionesRef = useRef(ubicaciones);
  ubicacionesRef.current = ubicaciones;

  const syncMarkers = (map: maplibregl.Map) => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const ubiqs = ubicacionesRef.current;
    for (const u of ubiqs) {
      const el = createFlotaMarkerEl();
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        buildPopupHTML(u),
      );
      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([u.lng, u.lat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
    }

    if (!hasFlown.current && ubiqs.length > 0) {
      hasFlown.current = true;
      if (ubiqs.length === 1) {
        map.flyTo({
          center: [ubiqs[0].lng, ubiqs[0].lat],
          zoom: 15,
          duration: 800,
        });
      } else {
        const bounds = new maplibregl.LngLatBounds();
        ubiqs.forEach((u) => bounds.extend([u.lng, u.lat]));
        map.fitBounds(bounds, { padding: 48, maxZoom: 14, duration: 800 });
      }
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = new maplibregl.Map({
      container: el,
      style: PROMSSAC_MAP_STYLES["default"],
      center: [-77, -12],
      zoom: 5,
      maxPitch: 85,
      attributionControl: false,
    });
    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showCompass: true,
        showZoom: true,
      }),
      "top-right",
    );

    mapRef.current = map;

    map.once("style.load", () => {
      syncMarkers(map);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      hasFlown.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    syncMarkers(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ubicaciones]);

  const handleStyleChange = (newStyle: PromssacMapStyleKey) => {
    setStyleKey(newStyle);
    const map = mapRef.current;
    if (!map) return;

    map.once("style.load", () => {
      if (newStyle === "liberty") {
        add3dBuildingsToMap(map);
      }
      map.easeTo({ pitch: newStyle === "liberty" ? 60 : 0, duration: 500 });
    });
    map.setStyle(PROMSSAC_MAP_STYLES[newStyle]);
  };

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-muted",
        className,
      )}
    >
      <div
        ref={containerRef}
        className={cn("h-full w-full", containerClassName)}
      />

      {ubicaciones.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="rounded-xl bg-background/80 px-6 py-4 text-center shadow-lg backdrop-blur-sm">
            <p className="text-sm font-medium text-foreground">
              Sin ubicaciones activas
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Los usuarios que compartan su ubicación aparecerán aquí.
            </p>
          </div>
        </div>
      )}

      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1.5">
        <label htmlFor="flota-map-style" className="sr-only">
          Estilo del mapa
        </label>
        <select
          id="flota-map-style"
          value={styleKey}
          onChange={(e) =>
            handleStyleChange(e.target.value as PromssacMapStyleKey)
          }
          className="rounded-md border border-border bg-background/95 px-2 py-1.5 text-xs text-foreground shadow-sm backdrop-blur-sm"
        >
          <option value="default">CARTO (claro)</option>
          <option value="bright">OpenFreeMap · bright</option>
          <option value="liberty">OpenFreeMap · 3D (Liberty)</option>
        </select>

        {ubicaciones.length > 0 && (
          <div className="w-52 max-h-[40vh] overflow-y-auto rounded-lg border border-border bg-background/95 shadow-lg backdrop-blur-sm">
            <div className="sticky top-0 z-[1] border-b border-border/60 bg-background/95 px-3 py-2 backdrop-blur-sm">
              <p className="text-xs font-semibold text-foreground">
                Conductores activos
              </p>
            </div>
            <div className="flex flex-col">
              {ubicaciones.map((u) => (
                <button
                  key={u.userId}
                  type="button"
                  onClick={() => {
                    const map = mapRef.current;
                    if (!map) return;
                    map.flyTo({
                      center: [u.lng, u.lat],
                      zoom: 16,
                      duration: 600,
                    });
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                    <MapPin className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {u.userName}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {tiempoRelativo(u.lastSeenIso)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlotaLiveMap;
