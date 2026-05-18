import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";

export interface EstadoDto {
  id: string;
  nombre: string;
  parentId: string | null;
  parentNombre: string | null;
  activo: boolean;
  esPadre: boolean;
}

export interface EstadoWriteBody {
  nombre: string;
  parentId?: string | null;
}

const BASE = "/api/v1/estados";

export const estadosApi = {
  listarPadres(incluirInactivos?: boolean): Promise<EstadoDto[]> {
    const q = incluirInactivos ? "?incluirInactivos=true" : "";
    return apiGet<EstadoDto[]>(`${BASE}/padres${q}`);
  },

  listarHijos(parentId: string): Promise<EstadoDto[]> {
    return apiGet<EstadoDto[]>(`${BASE}/${parentId}/hijos?incluirInactivos=true`);
  },

  listarHijosPorNombrePadre(nombrePadre: string): Promise<EstadoDto[]> {
    return apiGet<EstadoDto[]>(`${BASE}/hijos/por-padre?nombre=${encodeURIComponent(nombrePadre)}`);
  },

  create(body: EstadoWriteBody): Promise<EstadoDto> {
    return apiPost<EstadoDto, EstadoWriteBody>(BASE, body);
  },

  update(id: string, body: EstadoWriteBody): Promise<EstadoDto> {
    return apiPut<EstadoDto, EstadoWriteBody>(`${BASE}/${id}`, body);
  },

  setActivo(id: string, activo: boolean): Promise<void> {
    return apiPatch<{ activo: boolean }>(`${BASE}/${id}/activo`, { activo });
  },
};
