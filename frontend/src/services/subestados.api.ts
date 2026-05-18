import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";

export interface SubestadoDto {
  id: string;
  nombre: string;
  estadoPadre: string;
  activo: boolean;
}

export interface SubestadoWriteBody {
  nombre: string;
  estadoPadre: string;
}

const BASE = "/api/v1/subestados";

export const subestadosApi = {
  list(incluirInactivos?: boolean): Promise<SubestadoDto[]> {
    const q = incluirInactivos ? "?incluirInactivos=true" : "";
    return apiGet<SubestadoDto[]>(`${BASE}${q}`);
  },

  listByEstado(estado: string): Promise<SubestadoDto[]> {
    return apiGet<SubestadoDto[]>(`${BASE}/por-estado?estado=${encodeURIComponent(estado)}`);
  },

  create(body: SubestadoWriteBody): Promise<SubestadoDto> {
    return apiPost<SubestadoDto, SubestadoWriteBody>(BASE, body);
  },

  update(id: string, body: SubestadoWriteBody): Promise<SubestadoDto> {
    return apiPut<SubestadoDto, SubestadoWriteBody>(`${BASE}/${id}`, body);
  },

  setActivo(id: string, activo: boolean): Promise<void> {
    return apiPatch<{ activo: boolean }>(`${BASE}/${id}/activo`, { activo });
  },
};
