import type { Client, ClientBulkImportResult, ClientWriteBody } from "@/domain/clients";
import { clienteDesdeServidor } from "@/domain/clients";
import type { Order } from "@/domain/orders";
import { apiGet, apiPatchJson, apiPost, apiPut } from "@/lib/api";
import { endpoints } from "./endpoints";

function trimOrUndef(value: string | null | undefined): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s === "" ? undefined : s;
}

function writePayload(body: ClientWriteBody) {
  const nombre = body.nombre?.trim();
  const out: Record<string, unknown> = {
    ...(nombre ? { nombre } : {}),
    email: trimOrUndef(body.email),
    telefono: trimOrUndef(body.telefono),
    nombreApellidosDirectorIiee: trimOrUndef(body.nombreApellidosDirectorIiee),
    codigoRegional: trimOrUndef(body.codigoRegional),
    departamento: trimOrUndef(body.departamento),
    provincia: trimOrUndef(body.provincia),
    distrito: trimOrUndef(body.distrito),
    ugel: trimOrUndef(body.ugel),
    centroPoblado: trimOrUndef(body.centroPoblado),
    direccion: trimOrUndef(body.direccion),
    codigoModularIiee: trimOrUndef(body.codigoModularIiee),
    nivelEducacion: trimOrUndef(body.nivelEducacion),
  };
  if (body.ubicacionMapaLimpiar === true) {
    out.ubicacionMapaLimpiar = true;
  } else if (body.latitud != null && body.longitud != null) {
    out.latitud = body.latitud;
    out.longitud = body.longitud;
  }
  return out;
}

export const clientsApi = {
  list(incluirInactivos?: boolean): Promise<Client[]> {
    const q = incluirInactivos ? "?incluirInactivos=true" : "";
    return apiGet<Partial<Client>[]>(`${endpoints.clients}${q}`).then((rows) =>
      rows.map((r) =>
        clienteDesdeServidor(
          r as Partial<Client> & Pick<Client, "id" | "nombre">,
        ),
      ),
    );
  },

  search(query: string): Promise<Client[]> {
    const q = encodeURIComponent(query.trim());
    return apiGet<Partial<Client>[]>(`${endpoints.clients}/search?q=${q}`).then((rows) =>
      rows.map((r) => clienteDesdeServidor(r as Partial<Client> & Pick<Client, "id" | "nombre">)),
    );
  },

  get(id: string): Promise<Client> {
    return apiGet<Partial<Client> & Pick<Client, "id" | "nombre">>(
      `${endpoints.clients}/${encodeURIComponent(id)}`,
    ).then((r) => clienteDesdeServidor(r));
  },

  ordersForClient(clientId: string): Promise<Order[]> {
    return apiGet<Order[]>(
      `${endpoints.clients}/${encodeURIComponent(clientId)}/ordenes`,
    );
  },

  create(body: ClientWriteBody): Promise<Client> {
    return apiPost<Partial<Client> & Pick<Client, "id" | "nombre">, object>(
      endpoints.clients,
      {
        ...writePayload(body),
        activo: body.activo ?? true,
      },
    ).then((r) => clienteDesdeServidor(r));
  },

  update(id: string, body: ClientWriteBody): Promise<Client> {
    return apiPut<Partial<Client> & Pick<Client, "id" | "nombre">, object>(
      `${endpoints.clients}/${encodeURIComponent(id)}`,
      {
        ...writePayload(body),
        activo: body.activo ?? undefined,
      },
    ).then((r) => clienteDesdeServidor(r));
  },

  /** Hasta 2000 filas por llamada (el front fragmenta si hace falta). */
  importBatch(items: ClientWriteBody[]): Promise<ClientBulkImportResult> {
    return apiPost<ClientBulkImportResult, { items: object[] }>(
      `${endpoints.clients}/importacion/lote`,
      {
        items: items.map((b) => ({
          ...writePayload(b),
          activo: b.activo ?? true,
        })),
      },
    ).then((res) => ({
      fallos: res.fallos,
      creados: res.creados.map((r) =>
        clienteDesdeServidor(r as Partial<Client> & Pick<Client, "id" | "nombre">),
      ),
    }));
  },

  patchActivo(id: string, activo: boolean): Promise<Client> {
    return apiPatchJson<Partial<Client> & Pick<Client, "id" | "nombre">, { activo: boolean }>(
      `${endpoints.clients}/${encodeURIComponent(id)}/activo`,
      { activo },
    ).then((r) => clienteDesdeServidor(r));
  },
};
