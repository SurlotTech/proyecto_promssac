/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" = usar endpoint OnWay mapa en el backend; si no, lista estándar de dispositivos. */
  readonly VITE_FLEET_ONWAY_MAP?: string;
}
