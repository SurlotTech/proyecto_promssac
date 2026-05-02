import type { ApiResourceId } from "@/domain/apiResourceId";
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

export const webUsersApi = {
  list(): Promise<WebUserListItem[]> {
    return apiGet<WebUserListItem[]>(endpoints.usuariosWeb);
  },

  getById(id: string): Promise<WebUserDetail> {
    return apiGet<WebUserDetail>(`${endpoints.usuariosWeb}/${id}`);
  },

  create(body: WebUserCreateBody): Promise<ApiResourceId> {
    return apiPost<ApiResourceId, WebUserCreateBody>(endpoints.usuariosWeb, body);
  },

  update(id: string, body: WebUserUpdateBody): Promise<ApiResourceId> {
    return apiPut<ApiResourceId, WebUserUpdateBody>(`${endpoints.usuariosWeb}/${id}`, body);
  },

  setActivo(id: string, activo: boolean): Promise<void> {
    return apiPatch<{ activo: boolean }>(`${endpoints.usuariosWeb}/${id}/activo`, { activo });
  },
};
