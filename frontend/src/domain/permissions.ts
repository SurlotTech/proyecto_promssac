export interface PermissionDef {
  id: string;
  label: string;
  isSub?: boolean;
}

export interface PermissionGroup {
  id: string;
  title: string;
  total: number;
  permissions: PermissionDef[];
}

export const permissionGroups: PermissionGroup[] = [
  {
    id: "general",
    title: "General",
    total: 9,
    permissions: [
      { id: "g1", label: "Rutas" },
      { id: "g2", label: "Órdenes" },
      { id: "g2-1", label: "Crear órdenes", isSub: true },
      { id: "g2-2", label: "Editar órdenes", isSub: true },
      { id: "g2-3", label: "Editar gestión de una orden", isSub: true },
      { id: "g2-4", label: "Eliminar órdenes", isSub: true },
      { id: "g3", label: "Flota" },
      { id: "g4", label: "Clientes" },
      { id: "g6", label: "Alertas" },
    ],
  },
  {
    id: "ajustes",
    title: "Ajustes",
    total: 6,
    permissions: [
      { id: "a1", label: "Cuenta" },
      { id: "a2", label: "Usuarios" },
      { id: "a2-1", label: "Crear usuarios web", isSub: true },
      { id: "a2-2", label: "Crear usuarios móviles", isSub: true },
      { id: "a3", label: "Vehículos" },
      { id: "a4", label: "Configuración avanzada" },
    ],
  },
];

export const ALL_PERMISSION_IDS = permissionGroups.flatMap((g) =>
  g.permissions.map((p) => p.id),
);

export const DEFAULT_PERMISSIONS: Record<string, boolean> = Object.fromEntries(
  ALL_PERMISSION_IDS.map((id) => [id, false]),
);

export type PermissionsMap = Record<string, boolean>;

export interface AuthUser {
  id: string;
  nombreCompleto: string;
  nombreUsuario: string;
  email: string;
  rolNombre: string;
  permissions: PermissionsMap;
}

export interface LoginResponse {
  token: string;
  usuario: AuthUser;
}

export const SIDEBAR_PERMISSION_MAP: Record<string, string> = {
  "/": "g1",
  "/rutas": "g1",
  "/ordenes": "g2",
  "/flota": "g3",
  "/vehiculos": "a3",
  "/clientes": "g4",
  "/alertas": "g6",
  "/usuarios/web": "a2",
  "/usuarios/movil": "a2",
  "/configuracion/subestados": "a4",
  "/configuracion/alertas/parametros": "a4",
  "/configuracion/notificaciones": "a4",
};
