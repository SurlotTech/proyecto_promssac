import type { WebUserDetail, WebUserListItem, WebUserPermissionMode } from "@/domain/webUsers";
import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import { endpoints } from "./endpoints";

export type { WebUserDetail, WebUserListItem, WebUserPermissionMode };

export interface WebUserCreateBody {
  nombreCompleto: string;
  nombreUsuario: string;
  email: string;
  contrasena: string;
  permissionMode: WebUserPermissionMode;
  roleKey?: string;
  permissions: Record<string, boolean>;
}

export type WebUserUpdateBody = Omit<WebUserCreateBody, "contrasena"> & {
  contrasena?: string;
};

export type WebUserCreated = { id: string };

export const webUsersApi = {
  list(): Promise<WebUserListItem[]> {
    return apiGet<WebUserListItem[]>(endpoints.usuariosWeb);
  },

  getById(id: string): Promise<WebUserDetail> {
    return apiGet<WebUserDetail>(`${endpoints.usuariosWeb}/${id}`);
  },

  create(body: WebUserCreateBody): Promise<WebUserCreated> {
    return apiPost<WebUserCreated, WebUserCreateBody>(endpoints.usuariosWeb, body);
  },

  update(id: string, body: WebUserUpdateBody): Promise<WebUserCreated> {
    return apiPut<WebUserCreated, WebUserUpdateBody>(`${endpoints.usuariosWeb}/${id}`, body);
  },

  setActivo(id: string, activo: boolean): Promise<void> {
    return apiPatch<{ activo: boolean }>(`${endpoints.usuariosWeb}/${id}/activo`, { activo });
  },
};
