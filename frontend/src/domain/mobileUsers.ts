export type MobileUserVehicleMode = "list" | "create";

/** Respuesta dedicada GET …/opciones/ruta — solo para combos al crear rutas. */
export interface MobileUserRouteOption {
  id: string;
  nombreCompleto: string;
  vehiculoId: string;
}

export interface MobileUserListItem {
  id: string;
  nombreCompleto: string;
  nombreUsuario: string;
  estado: string;
  tipoUsuario: string;
  vehiculoTipo: string;
  vehiculoAsignado: string;
  fechaCreacion: string;
  diasActivo: number;
}

/** Texto para selects de rutas: nombre y apellido (nombre completo), sin id. */
export function mobileUserRouteSelectLabel(u: { nombreCompleto: string }): string {
  const n = u.nombreCompleto?.trim();
  return n && n.length > 0 ? n : "—";
}

export interface MobileUserDetail {
  id: string;
  nombreCompleto: string;
  nombreUsuario: string;
  telefono: string;
  fotoAprobada: boolean;
  vehicleMode: MobileUserVehicleMode;
  vehicleId: string;
  createVehicleType: string;
  createVehicleName: string;
  permissions: Record<string, boolean>;
  fotoUrl: string;
}
