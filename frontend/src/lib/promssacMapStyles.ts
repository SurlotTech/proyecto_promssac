import type maplibregl from "maplibre-gl";

/** Estilos MapLibre reutilizables en todo el sistema (CARTO, OpenFreeMap, Liberty 3D). */
export const PROMSSAC_MAP_STYLES = {
  default: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  bright: "https://tiles.openfreemap.org/styles/bright",
  liberty: "https://tiles.openfreemap.org/styles/liberty",
} as const;

export type PromssacMapStyleKey = keyof typeof PROMSSAC_MAP_STYLES;

export function add3dBuildingsToMap(map: maplibregl.Map) {
  const layers = map.getStyle()?.layers;
  const labelLayerId = layers?.find(
    (l) => l.type === "symbol" && l.layout?.["text-field"],
  )?.id;
  if (!map.getLayer("3d-buildings") && map.getSource("openmaptiles")) {
    map.addLayer(
      {
        id: "3d-buildings",
        source: "openmaptiles",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            0,
            14.05,
            ["get", "render_height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            0,
            14.05,
            ["get", "render_min_height"],
          ],
          "fill-extrusion-opacity": 0.6,
        },
      },
      labelLayerId,
    );
  }
}
