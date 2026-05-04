import type { Order } from "@/domain/orders";
import { apiGet, apiPost, apiPostNoContent } from "@/lib/api";
import { endpoints } from "./endpoints";

export interface OrderCreateInput {
  numeroOrden: string;
  /** yyyy-MM-dd */
  fechaRuta: string;
  rutaId?: string;
  vehiculoId?: string;
  estado?: string;
  subestado?: string;
  clienteNombre?: string;
  contactoNombre?: string;
  contactoIdentificador?: string;
  esUltimoDespacho?: boolean;
}

export interface OrderAssignBulkInput {
  rutaId: string;
  numerosOrden: string[];
}

function buildOrderCreateJson(input: OrderCreateInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    numeroOrden: input.numeroOrden.trim(),
    fechaRuta: input.fechaRuta,
  };
  if (input.rutaId?.trim()) body.rutaId = input.rutaId.trim();
  if (input.vehiculoId?.trim()) body.vehiculoId = input.vehiculoId.trim();
  if (input.estado?.trim()) body.estado = input.estado.trim();
  if (input.subestado?.trim()) body.subestado = input.subestado.trim();
  if (input.clienteNombre?.trim()) body.clienteNombre = input.clienteNombre.trim();
  if (input.contactoNombre?.trim()) body.contactoNombre = input.contactoNombre.trim();
  if (input.contactoIdentificador?.trim()) {
    body.contactoIdentificador = input.contactoIdentificador.trim();
  }
  if (input.esUltimoDespacho === true) body.esUltimoDespacho = true;
  return body;
}

export const ordersApi = {
  list(): Promise<Order[]> {
    return apiGet<Order[]>(endpoints.orders);
  },

  create(input: OrderCreateInput): Promise<Order> {
    return apiPost<Order, Record<string, unknown>>(endpoints.orders, buildOrderCreateJson(input));
  },

  assignBulk(input: OrderAssignBulkInput): Promise<void> {
    return apiPostNoContent(`${endpoints.orders}/asignacion-masiva`, {
      rutaId: input.rutaId,
      numerosOrden: input.numerosOrden.map((n) => n.trim()).filter(Boolean),
    });
  },
};
