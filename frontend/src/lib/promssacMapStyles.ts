/** Estilos MapLibre reutilizables en todo el sistema (CARTO, OpenFreeMap, Liberty 3D). */
export const PROMSSAC_MAP_STYLES = {
  default: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  bright: "https://tiles.openfreemap.org/styles/bright",
  liberty: "https://tiles.openfreemap.org/styles/liberty",
} as const;

export type PromssacMapStyleKey = keyof typeof PROMSSAC_MAP_STYLES;
