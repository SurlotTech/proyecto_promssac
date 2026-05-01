/** Límite alineado con `spring.servlet.multipart.max-file-size` (10MB). */
export const MAX_MOBILE_USER_PHOTO_BYTES = 10 * 1024 * 1024;

export const MOBILE_USER_PERMISSION_KEYS = [
  "borrar_ordenes",
  "subestado_vacio",
  "pre_entrega",
  "gestion_masiva",
  "reordenar_ruta",
  "agregar_ordenes",
  "crear_ordenes",
  "solo_geocerca",
  "reordenar_antes",
  "cambiar_tienda",
] as const;

export type MobileUserPermissionKey = (typeof MOBILE_USER_PERMISSION_KEYS)[number];

export const defaultMobileUserPermissions: Record<MobileUserPermissionKey, boolean> = {
  borrar_ordenes: false,
  subestado_vacio: false,
  pre_entrega: false,
  gestion_masiva: false,
  reordenar_ruta: false,
  agregar_ordenes: false,
  crear_ordenes: false,
  solo_geocerca: false,
  reordenar_antes: false,
  cambiar_tienda: false,
};

export const MOBILE_USER_PERMISSION_LABELS: Record<MobileUserPermissionKey, string> = {
  borrar_ordenes: "Borrar órdenes",
  subestado_vacio: "Permitir subestado vacío al entregar",
  pre_entrega: "Enviar notificaciones de pre-entrega automáticamente",
  gestion_masiva: "Gestionar órdenes de forma masiva",
  reordenar_ruta: "Reordenar órdenes durante la ruta",
  agregar_ordenes: "Agregar órdenes a la ruta",
  crear_ordenes: "Crear órdenes",
  solo_geocerca: "Solo dentro de la geocerca",
  reordenar_antes: "Reordenar órdenes antes de iniciar ruta",
  cambiar_tienda: "Permitir a usuario cambiar su tienda",
};

export const MOBILE_USER_PERM_LEFT_ORDER: readonly MobileUserPermissionKey[] = [
  "borrar_ordenes",
  "subestado_vacio",
  "pre_entrega",
  "gestion_masiva",
];

export const MOBILE_USER_PERM_RIGHT_TAIL: readonly MobileUserPermissionKey[] = [
  "reordenar_antes",
  "cambiar_tienda",
];

export function isMobileUserPinValid(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function mobileUserPermissionsFromApi(
  raw: Record<string, boolean> | undefined | null,
): Record<MobileUserPermissionKey, boolean> {
  const next = { ...defaultMobileUserPermissions };
  if (!raw) return next;
  for (const k of MOBILE_USER_PERMISSION_KEYS) {
    if (Object.prototype.hasOwnProperty.call(raw, k)) {
      next[k] = Boolean(raw[k]);
    }
  }
  return next;
}
