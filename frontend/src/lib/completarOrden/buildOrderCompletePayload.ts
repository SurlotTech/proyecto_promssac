import type { RoutePriority } from "@/domain/routes";
import { customFieldKeys, type CustomFieldKey } from "@/lib/completarOrden/constants";
import type { OrderCreationDraft } from "@/lib/orderCreationDraft";
import type { OrderCompleteInput } from "@/services/orders.api";

export type OrderCompleteFormSnapshot = {
  draft: OrderCreationDraft;
  contactName: string;
  contactIdentifier: string;
  contactPhone: string;
  contactEmail: string;
  addressLine: string;
  normalizedAddress: string;
  serviceMinutes: string;
  addressReference: string;
  latNum: number;
  lngNum: number;
  deliveryFrom: string;
  deliveryTo: string;
  mode: string;
  priority: RoutePriority;
  cod: boolean;
  customFields: Record<CustomFieldKey, string>;
};

function compactCustomFields(fields: Record<CustomFieldKey, string>): Record<string, string> | undefined {
  const out = Object.fromEntries(
    customFieldKeys.map((k) => [k, fields[k]?.trim() ?? ""]).filter(([, v]) => v.length > 0),
  ) as Record<string, string>;
  return Object.keys(out).length > 0 ? out : undefined;
}

export function buildOrderCompletePayload(s: OrderCompleteFormSnapshot): OrderCompleteInput {
  const minsParsed = parseInt(s.serviceMinutes, 10);
  return {
    numeroOrden: s.draft.displayOrderId.trim(),
    contactoNombre: s.contactName.trim(),
    contactoIdentificador: s.contactIdentifier.trim(),
    contactoTelefono: s.contactPhone.trim(),
    ...(s.contactEmail.trim() ? { contactoEmail: s.contactEmail.trim() } : {}),
    direccionLinea: s.addressLine.trim(),
    direccionNormalizada: s.normalizedAddress.trim() || undefined,
    latitud: s.latNum,
    longitud: s.lngNum,
    tiempoServicioMinutos: Number.isFinite(minsParsed) && minsParsed >= 0 ? minsParsed : undefined,
    referenciaDireccion: s.addressReference.trim() || undefined,
    ventanaEntregaDesde: s.deliveryFrom.trim() || undefined,
    ventanaEntregaHasta: s.deliveryTo.trim() || undefined,
    modoEntrega: s.mode.trim() || undefined,
    prioridadEntrega: s.priority,
    contraEntrega: s.cod,
    camposPersonalizados: compactCustomFields(s.customFields),
  };
}
