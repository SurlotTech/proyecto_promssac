export interface RolWebListItem {
  id: string;
  clave: string;
  nombre: string;
  activo: boolean;
  permisosActivos: number;
  usuariosAsignados: number;
  ultimaEdicion: string;
}

export interface RolWebOpcion {
  clave: string;
  nombre: string;
}

export interface RolWebDetail {
  id: string;
  clave: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  permissions: Record<string, boolean>;
}

export interface RolWebCreateBody {
  clave: string;
  nombre: string;
  descripcion?: string;
  permissions: Record<string, boolean>;
}

export type RolWebUpdateBody = Omit<RolWebCreateBody, "clave">;
