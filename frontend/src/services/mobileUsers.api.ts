import type {
  MobileUserDetail,
  MobileUserListItem,
  MobileUserRouteOption,
  MobileUserVehicleMode,
} from "@/domain/mobileUsers";
import type { MobileUserPermissionKey } from "@/domain/mobileUserForm";
import { apiGet, apiPatch, apiPostMultipartJson, apiPutMultipartJson } from "@/lib/api";
import { endpoints } from "./endpoints";

export interface MobileUserCreateBody {
  nombreCompleto: string;
  nombreUsuario: string;
  contrasena: string;
  telefono?: string;
  fotoAprobada: boolean;
  vehicleMode: MobileUserVehicleMode;
  vehicleId?: string;
  createVehicleType?: string;
  createVehicleName?: string;
  permissions: Record<MobileUserPermissionKey, boolean>;
}

export type MobileUserCreated = { id: string };

export type MobileUserUpdateBody = Omit<MobileUserCreateBody, "contrasena"> & {
  contrasena?: string;
};

export type { MobileUserDetail, MobileUserListItem, MobileUserRouteOption, MobileUserVehicleMode };

export const mobileUsersApi = {
  list(incluirInactivos?: boolean): Promise<MobileUserListItem[]> {
    const q = incluirInactivos ? "?incluirInactivos=true" : "";
    return apiGet<MobileUserListItem[]>(`${endpoints.usuariosMovil}${q}`);
  },

  listRouteOptions(): Promise<MobileUserRouteOption[]> {
    return apiGet<MobileUserRouteOption[]>(endpoints.usuariosMovilOpcionesRuta);
  },

  getById(id: string): Promise<MobileUserDetail> {
    return apiGet<MobileUserDetail>(`${endpoints.usuariosMovil}/${id}`);
  },

  create(body: MobileUserCreateBody, foto?: File | null): Promise<MobileUserCreated> {
    return apiPostMultipartJson<MobileUserCreated>(
      endpoints.usuariosMovil,
      "data",
      body,
      "foto",
      foto ?? undefined,
    );
  },

  update(id: string, body: MobileUserUpdateBody, foto?: File | null): Promise<MobileUserCreated> {
    return apiPutMultipartJson<MobileUserCreated>(
      `${endpoints.usuariosMovil}/${id}`,
      "data",
      body,
      "foto",
      foto ?? undefined,
    );
  },

  setActivo(id: string, activo: boolean): Promise<void> {
    return apiPatch<{ activo: boolean }>(`${endpoints.usuariosMovil}/${id}/activo`, { activo });
  },
};
