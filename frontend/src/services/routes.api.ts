import type { Route } from "@/domain/routes";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { endpoints } from "./endpoints";

export interface RouteWriteBody {
  codigo?: string | null;
  nombre: string;
  vehiculoId: string;
  usuarioMovilId?: string | null;
  fechaEntrega: string;
  horaInicio: string;
  horaFin?: string | null;
  prioridad?: string | null;
  estado?: string | null;
  lugar?: string | null;
  despachosCompletados?: number | null;
  despachosTotales?: number | null;
  cobroActual?: number | null;
  cobroTotal?: number | null;
  montoEnRuta?: number | null;
}

export const routesApi = {
  list(): Promise<Route[]> {
    return apiGet<Route[]>(endpoints.routes);
  },

  get(id: string): Promise<Route> {
    return apiGet<Route>(`${endpoints.routes}/${encodeURIComponent(id)}`);
  },

  create(body: RouteWriteBody): Promise<Route> {
    return apiPost<Route, RouteWriteBody>(endpoints.routes, body);
  },

  update(id: string, body: RouteWriteBody): Promise<Route> {
    return apiPut<Route, RouteWriteBody>(`${endpoints.routes}/${encodeURIComponent(id)}`, body);
  },

  remove(id: string): Promise<void> {
    return apiDelete(`${endpoints.routes}/${encodeURIComponent(id)}`);
  },
};
