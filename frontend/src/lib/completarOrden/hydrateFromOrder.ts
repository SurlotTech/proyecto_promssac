import type { Order } from "@/domain/orders";
import type { RoutePriority } from "@/domain/routes";
import { customFieldKeys, type CustomFieldKey } from "@/lib/completarOrden/constants";

export type CompletarHydrationSnapshot = {
  /** UUID del vehículo o cadena vacía si no hay. */
  vehicleId: string;
  deliveryFrom: string;
  deliveryTo: string;
  mode: string;
  priority: RoutePriority;
  cod: boolean;
  contactName: string;
  contactPhone: string;
  contactIdentifier: string;
  contactEmail: string;
  idType: string;
  addressLine: string;
  normalizedAddress: string;
  serviceMinutes: string;
  addressReference: string;
  lat: string;
  lng: string;
  customFields: Record<CustomFieldKey, string>;
};

function inferContactIdType(identifier: string): "dni" | "ruc" | "otro" {
  const t = identifier.trim();
  if (/^\d{8}$/.test(t)) return "dni";
  if (/^\d{11}$/.test(t)) return "ruc";
  return "otro";
}

function coercePriority(p: string | undefined): RoutePriority {
  if (p === "high" || p === "medium" || p === "low") return p;
  return "medium";
}

function formatCoord(n: number | undefined | null): string {
  if (n == null || !Number.isFinite(n)) return "";
  return n.toFixed(6);
}

function emptyCustomFieldsRecord(): Record<CustomFieldKey, string> {
  return Object.fromEntries(customFieldKeys.map((k) => [k, ""])) as Record<CustomFieldKey, string>;
}

/** Rellena el asistente Completar orden desde GET orden (edición). */
export function completarFormSnapshotFromOrder(order: Order): CompletarHydrationSnapshot {
  const customFields = emptyCustomFieldsRecord();
  if (order.customFields) {
    for (const k of customFieldKeys) {
      const v = order.customFields[k];
      if (v != null && String(v).trim()) {
        customFields[k] = String(v).trim();
      }
    }
  }

  const ident = order.contactIdentifier ?? "";
  return {
    vehicleId: order.vehicleId?.trim() ?? "",
    deliveryFrom: order.deliveryWindowFrom ?? "",
    deliveryTo: order.deliveryWindowTo ?? "",
    mode: order.deliveryMode?.trim() || "default",
    priority: coercePriority(order.deliveryPriority),
    cod: order.cashOnDelivery === true,
    contactName: order.contactName ?? "",
    contactPhone: order.contactPhone ?? "",
    contactIdentifier: ident,
    contactEmail: order.contactEmail ?? "",
    idType: inferContactIdType(ident),
    addressLine: order.addressLine ?? "",
    normalizedAddress: order.normalizedAddress ?? "",
    serviceMinutes:
      order.serviceMinutes != null && Number.isFinite(order.serviceMinutes)
        ? String(order.serviceMinutes)
        : "15",
    addressReference: order.addressReference ?? "",
    lat: formatCoord(order.latitude),
    lng: formatCoord(order.longitude),
    customFields,
  };
}
