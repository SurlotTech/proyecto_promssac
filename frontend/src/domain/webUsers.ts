export type WebUserPermissionMode = "rol" | "personalizado";

export interface WebUserListItem {
  id: string;
  nombreCompleto: string;
  nombreUsuario: string;
  estado: string;
  rolPermisos: string;
  ultimaConexion: string;
}

export interface WebUserDetail {
  id: string;
  nombreCompleto: string;
  nombreUsuario: string;
  email: string;
  permissionMode: WebUserPermissionMode;
  roleKey: string;
  permissions: Record<string, boolean>;
}
