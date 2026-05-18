import type { Order } from "@/domain/orders";
import { normalizeFechaRutaForApi } from "@/lib/fechaRutaApi";
import { apiDelete, apiGet, apiPost, apiPostNoContent, apiPut } from "@/lib/api";
import { endpoints } from "./endpoints";

export interface OrderCreateInput {
  numeroOrden: string;
  rutaId: string;
  fechaRuta?: string;
  estado?: string;
  subestado?: string;
  clienteId?: string;
  contactoNombre?: string;
  contactoIdentificador?: string;
  esUltimoDespacho?: boolean;
  vehiculoId?: string;
}

export interface OrderAssignBulkInput {
  rutaId: string;
  numerosOrden: string[];
}

/** Respuesta GET/POST `/ordenes/{numero}/productos`. */
export interface OrderProductLineDto {
  id: string;
  code: string;
  orderId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  weight?: number;
  customField: string;
  createdAt: string;
}

export interface OrderProductLineCreateInput {
  code: string;
  name: string;
  unitPrice: number;
  quantity: number;
  weight?: number;
  customField?: string;
}

function orderProductosPath(numeroOrden: string): string {
  return `${endpoints.orders}/${encodeURIComponent(numeroOrden.trim())}/productos`;
}

function buildProductLineBody(input: OrderProductLineCreateInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    code: input.code.trim(),
    name: input.name.trim(),
    unitPrice: input.unitPrice,
    quantity: input.quantity,
    /** Siempre enviamos `weight`: número o null para que el backend limpie `peso_kg`. */
    weight: input.weight ?? null,
  };
  if (input.customField?.trim()) body.customField = input.customField.trim();
  return body;
}

/** Payload para POST /ordenes/completar-datos (asistente Completar orden). */
export interface OrderCompleteInput {
  numeroOrden: string;
  contactoNombre?: string;
  contactoIdentificador?: string;
  contactoTelefono?: string;
  contactoEmail?: string;
  direccionLinea?: string;
  direccionNormalizada?: string;
  latitud?: number;
  longitud?: number;
  tiempoServicioMinutos?: number;
  referenciaDireccion?: string;
  ventanaEntregaDesde?: string;
  ventanaEntregaHasta?: string;
  modoEntrega?: string;
  prioridadEntrega?: string;
  contraEntrega?: boolean;
  camposPersonalizados?: Record<string, string>;
  /** UUID del vehículo a asignar (mutuamente excluyente con quitarVehiculo en práctica). */
  vehiculoId?: string;
  /** Quitar vehículo y placa de la orden. */
  quitarVehiculo?: boolean;
  /** UUID del cliente de catálogo a vincular. */
  clientId?: string;
}

function buildOrderCreateJson(input: OrderCreateInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    numeroOrden: input.numeroOrden.trim(),
    rutaId: input.rutaId.trim(),
  };
  if (input.fechaRuta?.trim()) body.fechaRuta = normalizeFechaRutaForApi(input.fechaRuta);
  if (input.vehiculoId?.trim()) body.vehiculoId = input.vehiculoId.trim();
  if (input.estado?.trim()) body.estado = input.estado.trim();
  if (input.subestado?.trim()) body.subestado = input.subestado.trim();
  if (input.clienteId?.trim()) body.clienteId = input.clienteId.trim();
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

  /** Una orden por número (para rellenar el asistente al editar). */
  getByNumero(numeroOrden: string): Promise<Order> {
    const q = encodeURIComponent(numeroOrden.trim());
    return apiGet<Order>(`${endpoints.orders}/${q}`);
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

  completarDatos(input: OrderCompleteInput): Promise<Order> {
    return apiPost<Order, OrderCompleteInput>(`${endpoints.orders}/completar-datos`, input);
  },

  listProductLines(numeroOrden: string): Promise<OrderProductLineDto[]> {
    return apiGet<OrderProductLineDto[]>(orderProductosPath(numeroOrden));
  },

  createProductLine(
    numeroOrden: string,
    input: OrderProductLineCreateInput,
  ): Promise<OrderProductLineDto> {
    return apiPost<OrderProductLineDto, Record<string, unknown>>(
      orderProductosPath(numeroOrden),
      buildProductLineBody(input),
    );
  },

  updateProductLine(
    numeroOrden: string,
    productId: string,
    input: OrderProductLineCreateInput,
  ): Promise<OrderProductLineDto> {
    const path = `${orderProductosPath(numeroOrden)}/${encodeURIComponent(productId.trim())}`;
    return apiPut<OrderProductLineDto, Record<string, unknown>>(path, buildProductLineBody(input));
  },

  deleteProductLine(numeroOrden: string, productId: string): Promise<void> {
    const path = `${orderProductosPath(numeroOrden)}/${encodeURIComponent(productId.trim())}`;
    return apiDelete(path);
  },
};
