import type { MutableRefObject } from "react";
import type maplibregl from "maplibre-gl";
import type { PromssacMapRef } from "@/components/maps";

type ApplyFn = (map: maplibregl.Map, marker: maplibregl.Marker) => void;

/**
 * Ejecuta `apply` cuando existen map y marker (p. ej. tras montar PromssacMap).
 * Reintenta con requestAnimationFrame para evitar carreras con onMap.
 */
export function runWhenMapAndMarkerReady(
  mapRef: MutableRefObject<PromssacMapRef | null>,
  markerRef: MutableRefObject<maplibregl.Marker | null>,
  apply: ApplyFn,
  maxFrames = 90,
): () => void {
  let alive = true;
  let frames = 0;

  const tick = () => {
    if (!alive) return;
    const map = mapRef.current?.getMap() ?? null;
    const marker = markerRef.current;
    if (map && marker) {
      apply(map, marker);
      return;
    }
    frames += 1;
    if (frames < maxFrames) requestAnimationFrame(tick);
  };

  tick();
  return () => {
    alive = false;
  };
}
