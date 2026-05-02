import type { ApiResourceId } from "@/domain/apiResourceId";
import type {
  RolWebCreateBody,
  RolWebDetail,
  RolWebListItem,
  RolWebOpcion,
  RolWebUpdateBody,
} from "@/domain/webRoles";
import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import { endpoints } from "./endpoints";

export const webRolesApi = {
  list(): Promise<RolWebListItem[]> {
    return apiGet<RolWebListItem[]>(endpoints.rolesWeb);
  },

  listOpciones(): Promise<RolWebOpcion[]> {
    return apiGet<RolWebOpcion[]>(`${endpoints.rolesWeb}/opciones`);
  },

  getById(id: string): Promise<RolWebDetail> {
    return apiGet<RolWebDetail>(`${endpoints.rolesWeb}/${id}`);
  },

  create(body: RolWebCreateBody): Promise<ApiResourceId> {
    return apiPost<ApiResourceId, RolWebCreateBody>(endpoints.rolesWeb, body);
  },

  update(id: string, body: RolWebUpdateBody): Promise<ApiResourceId> {
    return apiPut<ApiResourceId, RolWebUpdateBody>(`${endpoints.rolesWeb}/${id}`, body);
  },

  setActivo(id: string, activo: boolean): Promise<void> {
    return apiPatch<{ activo: boolean }>(`${endpoints.rolesWeb}/${id}/activo`, { activo });
  },
};
