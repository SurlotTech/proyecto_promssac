import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import { PROMSSAC_MAP_STYLES, type PromssacMapStyleKey, add3dBuildingsToMap } from "@/lib/promssacMapStyles";

export type PromssacMapRef = {
  getMap: () => maplibregl.Map | null;
};

export type PromssacMapProps = {
  /** Al cambiar se destruye y se crea otra instancia del mapa. */
  mapKey: string;
  /** Centro inicial [longitud, latitud] al crear el mapa (no se re-sincroniza solo al mover coords; usá ref + flyTo desde fuera si hace falta). */
  center: [number, number];
  zoom?: number;
  className?: string;
  containerClassName?: string;
  /** Selector CARTO / OpenFreeMap / Liberty (3D + pitch). */
  showStylePicker?: boolean;
  /** Al cambiar `mapKey`, volver al estilo CARTO. */
  resetStyleOnMapKeyChange?: boolean;
  /** Estilo inicial del mapa (default, bright, liberty). */
  defaultStyle?: PromssacMapStyleKey;
  /**
   * Llamado al crear el mapa. Podés enganchar listeners o marcadores.
   * Si devolvés una función, se ejecuta al destruir el mapa (mismo criterio que `mapKey`).
   */
  onMap?: (map: maplibregl.Map) => void | (() => void);
};

export const PromssacMap = forwardRef<PromssacMapRef, PromssacMapProps>(function PromssacMap(
  {
    mapKey,
    center,
    zoom = 12,
    className,
    containerClassName,
    showStylePicker = true,
    resetStyleOnMapKeyChange = true,
    defaultStyle,
    onMap,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<maplibregl.Map | null>(null);
  const onMapRef = useRef(onMap);
  onMapRef.current = onMap;

  const centerRef = useRef(center);
  const zoomRef = useRef(zoom);
  centerRef.current = center;
  zoomRef.current = zoom;

  const [styleKey, setStyleKey] = useState<PromssacMapStyleKey>(defaultStyle || "default");

  useImperativeHandle(ref, () => ({
    getMap: () => mapInst.current,
  }));

  useLayoutEffect(() => {
    if (resetStyleOnMapKeyChange) setStyleKey(defaultStyle || "default");
  }, [mapKey, resetStyleOnMapKeyChange, defaultStyle]);

  useEffect(() => {
    if (!mapKey) return;
    const el = containerRef.current;
    if (!el) return;

    const map = new maplibregl.Map({
      container: el,
      style: PROMSSAC_MAP_STYLES[styleKey],
      center: centerRef.current,
      zoom: zoomRef.current,
      maxPitch: 85,
      pitch: styleKey === "liberty" ? 60 : 0,
    });
    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showCompass: true,
        showZoom: true,
      }),
      "top-right",
    );
    mapInst.current = map;
    const cleanupUser = onMapRef.current?.(map);

    return () => {
      if (typeof cleanupUser === "function") cleanupUser();
      map.remove();
      mapInst.current = null;
    };
  }, [mapKey]);

  useEffect(() => {
    const map = mapInst.current;
    if (!map) return;

    const currentStyleUrl = PROMSSAC_MAP_STYLES[styleKey];
    // MapLibre's getStyle().name or checking against internal state is complex, 
    // but setStyle is generally smart enough. Still, we only want to add 3D logic after it's done.

    map.setStyle(currentStyleUrl);

    const handleStyleLoad = () => {
      if (styleKey === "liberty") {
        add3dBuildingsToMap(map);
      }
      map.easeTo({ pitch: styleKey === "liberty" ? 60 : 0, duration: 500 });
    };

    map.once("style.load", handleStyleLoad);
  }, [styleKey]);

  if (!mapKey) {
    return <div className={cn("relative", className)} />;
  }

  return (
    <div className={cn("relative !h-full !w-full", className)}>
      <div
        ref={containerRef}
        className={cn("w-full overflow-hidden rounded-xl border border-border bg-muted/20", containerClassName)}
      />
      {showStylePicker ? (
        <div className="absolute left-2 top-2 z-10">
          <label htmlFor="promssac-map-style" className="sr-only">
            Estilo del mapa
          </label>
          <select
            id="promssac-map-style"
            value={styleKey}
            onChange={(e) => setStyleKey(e.target.value as PromssacMapStyleKey)}
            className="rounded-md border border-border bg-background/95 px-2 py-1.5 text-xs text-foreground shadow-sm backdrop-blur-sm"
          >
            <option value="default">CARTO (claro)</option>
            <option value="bright">OpenFreeMap · bright</option>
            <option value="liberty">OpenFreeMap · 3D (Liberty)</option>
          </select>
        </div>
      ) : null}
    </div>
  );
});
